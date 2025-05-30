import type { Task, Attachment, TaskStep } from "@/types/database"

// Mock user data
export const mockUser = {
  uid: "mock-user-123",
  email: "user@example.com",
  displayName: "Demo User",
  photoURL: null,
  emailVerified: true,
}

// Mock attachments
const mockAttachments: Attachment[] = [
  {
    id: "att-1",
    type: "file",
    name: "report.pdf",
    fileType: "application",
  },
  {
    id: "att-2",
    type: "voice",
    name: "Voice message",
    duration: 45,
  },
  {
    id: "att-3",
    type: "file",
    name: "screenshot.png",
    fileType: "image",
  },
]

// Mock task steps
const mockSteps: TaskStep[] = [
  {
    id: "step-1",
    title: "Research requirements",
    description: "Gather all necessary information and requirements for the task",
    status: "completed",
    order: 1,
    estimatedTime: "15 mins",
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "step-2",
    title: "Create initial draft",
    description: "Prepare the first version of the document or deliverable",
    status: "completed",
    order: 2,
    estimatedTime: "30 mins",
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "step-3",
    title: "Review and refine",
    description: "Check for accuracy and make necessary improvements",
    status: "in-progress",
    order: 3,
    estimatedTime: "20 mins",
  },
  {
    id: "step-4",
    title: "Final submission",
    description: "Submit the completed work for approval",
    status: "pending",
    order: 4,
    estimatedTime: "10 mins",
  },
]

// Generate mock tasks
export const generateMockTasks = (): Task[] => {
  const now = new Date()

  return [
    {
      id: "task-1",
      title: "Review quarterly financial report",
      description:
        "Go through the Q3 financial report and prepare summary for the board meeting next week. This includes analyzing revenue trends, expense patterns, and identifying key insights for strategic decision making.",
      status: "pending",
      priority: "high",
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      userId: mockUser.uid,
      category: "document",
      estimatedTime: "45 mins",
      progress: 25,
      steps: [
        {
          id: "step-1-1",
          title: "Download financial reports",
          description: "Access and download Q3 financial reports from the system",
          status: "completed",
          order: 1,
          estimatedTime: "5 mins",
          completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "step-1-2",
          title: "Analyze revenue trends",
          description: "Review revenue patterns and compare with previous quarters",
          status: "in-progress",
          order: 2,
          estimatedTime: "20 mins",
        },
        {
          id: "step-1-3",
          title: "Prepare executive summary",
          description: "Create a concise summary for board presentation",
          status: "pending",
          order: 3,
          estimatedTime: "20 mins",
        },
      ],
    },
    {
      id: "task-2",
      title: "Complete tax filing form",
      description:
        "Fill out the annual tax filing form and submit it to the accounting department. Ensure all deductions are properly documented and calculations are accurate.",
      status: "in-progress",
      priority: "high",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      userId: mockUser.uid,
      category: "form",
      estimatedTime: "30 mins",
      agentId: "agent-1",
      agentLabel: "Tax Specialist",
      agentDescription: "Working on optimizing your tax deductions and ensuring compliance",
      attachments: [mockAttachments[0]],
      progress: 75,
      steps: [
        {
          id: "step-2-1",
          title: "Gather tax documents",
          description: "Collect all necessary tax documents and receipts",
          status: "completed",
          order: 1,
          estimatedTime: "10 mins",
          completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "step-2-2",
          title: "Fill out forms",
          description: "Complete all required tax forms with accurate information",
          status: "completed",
          order: 2,
          estimatedTime: "15 mins",
          completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "step-2-3",
          title: "Review and submit",
          description: "Final review and submission to accounting department",
          status: "in-progress",
          order: 3,
          estimatedTime: "5 mins",
        },
      ],
    },
    {
      id: "task-3",
      title: "Book flight tickets for conference",
      description:
        "Research and book flight tickets for the tech conference in San Francisco next month. Compare prices and find the best options for travel dates.",
      status: "completed",
      priority: "medium",
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      userId: mockUser.uid,
      category: "web-task",
      estimatedTime: "20 mins",
      progress: 100,
      completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      steps: [
        {
          id: "step-3-1",
          title: "Research flight options",
          description: "Compare different airlines and flight times",
          status: "completed",
          order: 1,
          estimatedTime: "10 mins",
          completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "step-3-2",
          title: "Book tickets",
          description: "Complete the booking process and payment",
          status: "completed",
          order: 2,
          estimatedTime: "10 mins",
          completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: "task-4",
      title: "Schedule team performance reviews",
      description:
        "Set up meetings with team members for quarterly performance reviews. Coordinate calendars and prepare review materials for each team member.",
      status: "scheduled",
      priority: "medium",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      scheduledFor: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      userId: mockUser.uid,
      category: "other",
      estimatedTime: "2 hours",
      isRecurring: true,
      recurringPattern: "quarterly",
      progress: 40,
      steps: [
        {
          id: "step-4-1",
          title: "Prepare review templates",
          description: "Create standardized review forms and evaluation criteria",
          status: "completed",
          order: 1,
          estimatedTime: "30 mins",
          completedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "step-4-2",
          title: "Schedule meetings",
          description: "Coordinate with team members to find suitable meeting times",
          status: "in-progress",
          order: 2,
          estimatedTime: "45 mins",
        },
        {
          id: "step-4-3",
          title: "Conduct reviews",
          description: "Hold individual performance review meetings",
          status: "pending",
          order: 3,
          estimatedTime: "45 mins",
        },
      ],
    },
    {
      id: "task-5",
      title: "Update company handbook",
      description:
        "Review and update the company handbook with new policies and procedures. Ensure all sections are current and reflect recent organizational changes.",
      status: "pending",
      priority: "low",
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      userId: mockUser.uid,
      category: "document",
      estimatedTime: "3 hours",
      progress: 15,
      steps: [
        {
          id: "step-5-1",
          title: "Review current handbook",
          description: "Go through existing handbook to identify outdated sections",
          status: "completed",
          order: 1,
          estimatedTime: "45 mins",
          completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "step-5-2",
          title: "Research policy updates",
          description: "Gather information on new policies and procedures",
          status: "pending",
          order: 2,
          estimatedTime: "60 mins",
        },
        {
          id: "step-5-3",
          title: "Draft updates",
          description: "Write new sections and revise existing content",
          status: "pending",
          order: 3,
          estimatedTime: "75 mins",
        },
      ],
    },
    {
      id: "task-6",
      title: "Prepare presentation for client meeting",
      description:
        "Create slides for the upcoming client presentation on the new product features. Include demos, benefits, and implementation timeline.",
      status: "in-progress",
      priority: "high",
      createdAt: new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      userId: mockUser.uid,
      category: "document",
      estimatedTime: "2 hours",
      agentId: "agent-2",
      agentLabel: "Presentation Assistant",
      agentDescription: "Creating professional slides with your content and ensuring visual consistency",
      attachments: [mockAttachments[2]],
      progress: 60,
      steps: [
        {
          id: "step-6-1",
          title: "Outline presentation structure",
          description: "Plan the flow and key points for the presentation",
          status: "completed",
          order: 1,
          estimatedTime: "20 mins",
          completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "step-6-2",
          title: "Create slides",
          description: "Design and build presentation slides with content",
          status: "in-progress",
          order: 2,
          estimatedTime: "80 mins",
        },
        {
          id: "step-6-3",
          title: "Practice presentation",
          description: "Rehearse the presentation and time the delivery",
          status: "pending",
          order: 3,
          estimatedTime: "20 mins",
        },
      ],
    },
  ]
}

// Mock tasks data store
let mockTasks = generateMockTasks()

// Mock database operations
export const mockDatabase = {
  // Get all tasks
  getTasks: () => mockTasks,

  // Get tasks by status
  getTasksByStatus: (status: string) => mockTasks.filter((task) => task.status === status),

  // Add a new task
  addTask: (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    mockTasks = [newTask, ...mockTasks]
    return newTask.id
  },

  // Update a task
  updateTask: (taskId: string, updates: Partial<Task>) => {
    mockTasks = mockTasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    return true
  },

  // Delete a task
  deleteTask: (taskId: string) => {
    mockTasks = mockTasks.filter((task) => task.id !== taskId)
    return true
  },

  // Reset to initial data
  resetData: () => {
    mockTasks = generateMockTasks()
  },
}
