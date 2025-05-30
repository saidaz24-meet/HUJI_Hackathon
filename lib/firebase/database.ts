import { ref, push, set, onValue, off, update, remove, get, query, orderByChild, equalTo } from "firebase/database"
import { db } from "./config"
import type { Task, User, Attachment, Notification } from "@/types/database"
import { mockDatabase } from "../mock-data"

// Set to false to use Firebase instead of mock data
const USE_MOCK_DATA = false

export class DatabaseService {
  // Create a new task
  static async createTask(userId: string, taskData: Omit<Task, "id" | "userId" | "createdAt">): Promise<string> {
    if (USE_MOCK_DATA) {
      return mockDatabase.addTask({
        ...taskData,
        userId,
      })
    }

    try {
      const tasksRef = ref(db, `users/${userId}/tasks`)
      const newTaskRef = push(tasksRef)
      const taskId = newTaskRef.key!

      // Create clean task object without undefined values
      const task: Task = {
        id: taskId,
        userId,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        category: taskData.category,
        createdAt: new Date().toISOString(),
        model: taskData.model || "shaman-light",
        // Only include attachments if they exist and have values
        ...(taskData.attachments && taskData.attachments.length > 0 ? { attachments: taskData.attachments } : {})
      }

      await set(newTaskRef, task)

      // Also add to pending tasks for backend processing
      const pendingTaskRef = ref(db, `pendingTasks/${taskId}`)
      await set(pendingTaskRef, task)

      return taskId
    } catch (error) {
      console.error("Error creating task:", error)
      throw error
    }
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

  // Get tasks by status
  static listenToTasksByStatus(userId: string, status: Task["status"], callback: (tasks: Task[]) => void): () => void {
    if (USE_MOCK_DATA) {
      // Filter mock tasks by status
      const filteredTasks = mockDatabase.getTasks().filter((task) => task.status === status)
      callback(filteredTasks)

      // Return a no-op cleanup function
      return () => {}
    }

    const tasksRef = ref(db, `users/${userId}/tasks`)

    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        callback([])
        return
      }

      const tasks: Task[] = Object.values(data)
      const filteredTasks = tasks.filter(task => task.status === status)
      callback(filteredTasks)
    })

    return () => off(tasksRef, "value", unsubscribe)
  }

  // Update task
  static async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<void> {
    if (USE_MOCK_DATA) {
      mockDatabase.updateTask(taskId, updates)
      return
    }

    try {
      const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
      await update(taskRef, updates)

      // Update in pending tasks if it exists there
      const pendingTaskRef = ref(db, `pendingTasks/${taskId}`)
      const snapshot = await get(pendingTaskRef)
      if (snapshot.exists()) {
        await update(pendingTaskRef, updates)
      }
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  }

  // Delete task
  static async deleteTask(userId: string, taskId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      mockDatabase.deleteTask(taskId)
      return
    }

    try {
      const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
      await remove(taskRef)

      // Also check if it's in pendingTasks and remove
      const pendingTaskRef = ref(db, `pendingTasks/${taskId}`)
      const snapshot = await get(pendingTaskRef)
      if (snapshot.exists()) {
        await remove(pendingTaskRef)
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      throw error
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, userData: Partial<User>): Promise<void> {
    if (USE_MOCK_DATA) {
      // No-op for mock data
      return
    }

    try {
      const userRef = ref(db, `users/${userId}/profile`)
      await update(userRef, userData)
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw error
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<User | null> {
    if (USE_MOCK_DATA) {
      return null
    }

    try {
      const userRef = ref(db, `users/${userId}/profile`)
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        return snapshot.val()
      }

      return null
    } catch (error) {
      console.error("Error getting user profile:", error)
      throw error
    }
  }

  // Save user profile data
  static async saveUserProfileData(userId: string, profileData: any): Promise<void> {
    if (USE_MOCK_DATA) {
      return
    }

    try {
      const profileRef = ref(db, `users/${userId}/profileData`)
      await set(profileRef, profileData)
    } catch (error) {
      console.error("Error saving user profile data:", error)
      throw error
    }
  }

  // Get user profile data
  static async getUserProfileData(userId: string): Promise<any | null> {
    if (USE_MOCK_DATA) {
      return null
    }

    try {
      const profileRef = ref(db, `users/${userId}/profileData`)
      const snapshot = await get(profileRef)

      if (snapshot.exists()) {
        return snapshot.val()
      }

      return null
    } catch (error) {
      console.error("Error getting user profile data:", error)
      return null
    }
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

  // Create a notification
  static async createNotification(userId: string, notification: Omit<Notification, "id" | "createdAt">): Promise<string> {
    if (USE_MOCK_DATA) {
      return "mock-notification-id"
    }

    try {
      const notificationsRef = ref(db, `users/${userId}/notifications`)
      const newNotificationRef = push(notificationsRef)
      const notificationId = newNotificationRef.key!

      const fullNotification: Notification = {
        ...notification,
        id: notificationId,
        createdAt: new Date().toISOString(),
      }

      await set(newNotificationRef, fullNotification)
      return notificationId
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  }

  // Get user's notifications
  static listenToUserNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    if (USE_MOCK_DATA) {
      callback([])
      return () => {}
    }

    const notificationsRef = ref(db, `users/${userId}/notifications`)

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val()
      const notifications: Notification[] = data ? Object.values(data) : []
      callback(notifications.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    })

    return () => off(notificationsRef, "value", unsubscribe)
  }

  // Mark notification as read
  static async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return
    }

    try {
      const notificationRef = ref(db, `users/${userId}/notifications/${notificationId}`)
      await update(notificationRef, { read: true })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }

  // Delete notification
  static async deleteNotification(userId: string, notificationId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return
    }

    try {
      const notificationRef = ref(db, `users/${userId}/notifications/${notificationId}`)
      await remove(notificationRef)
    } catch (error) {
      console.error("Error deleting notification:", error)
      throw error
    }
  }

  // Get task by ID
  static async getTaskById(userId: string, taskId: string): Promise<Task | null> {
    if (USE_MOCK_DATA) {
      const task = mockDatabase.getTasks().find(t => t.id === taskId)
      return task || null
    }

    try {
      const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
      const snapshot = await get(taskRef)

      if (snapshot.exists()) {
        return snapshot.val()
      }

      return null
    } catch (error) {
      console.error("Error getting task by ID:", error)
      return null
    }
  }

  // Initialize user data structure in database
  static async initializeUserData(userId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return
    }

    try {
      const userRef = ref(db, `users/${userId}`)
      const snapshot = await get(userRef)

      if (!snapshot.exists()) {
        await set(userRef, {
          tasks: {},
          notifications: {},
          profileData: {
            fullName: "",
            phoneNumber: "",
            address: {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: ""
            },
            signature: null
          }
        })
      }
    } catch (error) {
      console.error("Error initializing user data:", error)
      throw error
    }
  }

  // Update task progress
  static async updateTaskProgress(userId: string, taskId: string, progress: number): Promise<void> {
    if (USE_MOCK_DATA) {
      mockDatabase.updateTask(taskId, { progress })
      return
    }

    try {
      const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
      await update(taskRef, { progress })

      // Update in pending tasks if it exists there
      const pendingTaskRef = ref(db, `pendingTasks/${taskId}`)
      const snapshot = await get(pendingTaskRef)
      if (snapshot.exists()) {
        await update(pendingTaskRef, { progress })
      }
    } catch (error) {
      console.error("Error updating task progress:", error)
      throw error
    }
  }
}