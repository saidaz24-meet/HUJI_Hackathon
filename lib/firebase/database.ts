import { ref, push, set, onValue, off, update, remove } from "firebase/database"
import { db } from "./config"
import type { Task, User } from "@/types/database"
import { mockDatabase } from "../mock-data"

// Flag to use mock data instead of Firebase
const USE_MOCK_DATA = true

export class DatabaseService {
  // Create a new task
  static async createTask(userId: string, taskData: Omit<Task, "id" | "userId" | "createdAt">): Promise<string> {
    if (USE_MOCK_DATA) {
      return mockDatabase.addTask({
        ...taskData,
        userId,
      })
    }

    const tasksRef = ref(db, `users/${userId}/tasks`)
    const newTaskRef = push(tasksRef)
    const taskId = newTaskRef.key!

    const task: Task = {
      ...taskData,
      id: taskId,
      userId,
      createdAt: new Date().toISOString(),
    }

    await set(newTaskRef, task)

    // Also add to pending tasks for backend processing
    const pendingTaskRef = ref(db, `pendingTasks/${taskId}`)
    await set(pendingTaskRef, task)

    return taskId
  }

  // Listen to user's tasks
  static listenToUserTasks(userId: string, callback: (tasks: Task[]) => void): () => void {
    if (USE_MOCK_DATA) {
      // Initial callback with mock data
      callback(mockDatabase.getTasks())

      // Return a no-op cleanup function
      return () => {}
    }

    const tasksRef = ref(db, `users/${userId}/tasks`)

    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val()
      const tasks: Task[] = data ? Object.values(data) : []
      callback(tasks)
    })

    return () => off(tasksRef, "value", unsubscribe)
  }

  // Update task status
  static async updateTaskStatus(userId: string, taskId: string, status: Task["status"]): Promise<void> {
    if (USE_MOCK_DATA) {
      mockDatabase.updateTask(taskId, { status })
      return
    }

    const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
    await update(taskRef, { status })
  }

  // Delete task
  static async deleteTask(userId: string, taskId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      mockDatabase.deleteTask(taskId)
      return
    }

    const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
    await remove(taskRef)
  }

  // Update user profile
  static async updateUserProfile(userId: string, userData: Partial<User>): Promise<void> {
    if (USE_MOCK_DATA) {
      // No-op for mock data
      return
    }

    const userRef = ref(db, `users/${userId}/profile`)
    await update(userRef, userData)
  }

  // Listen to task errors
  static listenToTaskErrors(userId: string, callback: (errors: Task[]) => void): () => void {
    if (USE_MOCK_DATA) {
      // Filter mock tasks with errors
      const errorTasks = mockDatabase.getTasks().filter((task) => task.is_error)
      callback(errorTasks)

      // Return a no-op cleanup function
      return () => {}
    }

    const tasksRef = ref(db, `users/${userId}/tasks`)

    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val()
      const tasks: Task[] = data ? Object.values(data) : []
      const errorTasks = tasks.filter((task) => task.is_error)
      callback(errorTasks)
    })

    return () => off(tasksRef, "value", unsubscribe)
  }
}
