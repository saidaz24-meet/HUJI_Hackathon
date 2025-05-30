// types/database.ts
// Database types for Firebase Realtime Database
export interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "scheduled"
  priority: "low" | "medium" | "high"
  createdAt: string // ISO string
  scheduledFor?: string // ISO string
  isRecurring?: boolean
  recurringPattern?: "daily" | "weekly" | "monthly"
  attachments?: Attachment[]
  estimatedTime?: string
  category: "document" | "web-task" | "form" | "other"
  userId: string
  agentId?: string
  agentLabel?: string
  agentDescription?: string
  is_error?: boolean
  errorMessage?: string
  steps?: TaskStep[]
  progress?: number // 0-100 percentage
  completedAt?: string // ISO string when completed
  startTime?: number // Unix timestamp when task started processing
  model: "shaman-light" | "shaman-pro" // Model to use for processing
  completionProof?: CompletionProof // Proof of task completion
}

export interface CompletionProof {
  type: "document" | "screenshot" | "confirmation" | "report"
  url?: string
  reference?: string
  summary: string
}

export interface TaskStep {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  order: number
  estimatedTime?: string
  completedAt?: string
}

export interface Attachment {
  id: string
  type: "file" | "voice"
  name: string
  fileType?: string
  duration?: number
  url?: string
}

export interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: string
  lastLoginAt: string
}

export interface Agent {
  id: string
  name: string
  status: "available" | "busy" | "offline"
  assignedTasks: string[]
  capabilities: string[]
}

export interface Notification {
  id: string
  message: string
  type: "info" | "success" | "warning" | "error"
  createdAt: string
  read: boolean
  taskId?: string
}

export interface DatabaseStructure {
  users: {
    [userId: string]: {
      profile: User
      tasks: {
        [taskId: string]: Task
      }
      notifications: {
        [notificationId: string]: Notification
      }
    }
  }
  agents: {
    [agentId: string]: Agent
  }
  pendingTasks: {
    [taskId: string]: Task
  }
}