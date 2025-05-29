"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Moon,
  Sun,
  Send,
  Paperclip,
  Settings,
  FileText,
  ImageIcon,
  Sparkles,
  Zap,
  MoreHorizontal,
  Loader2,
  LogOut,
  UserCircle,
  Bell,
  Mic,
  X,
  CheckCircle,
  ChevronDownIcon,
  Trash2,
  Calendar,
  Clock,
  Play,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
} from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useTheme } from "@/hooks/use-theme"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Attachment {
  id: string
  type: "file" | "voice"
  name: string
  fileType?: string
  duration?: number
}

interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "scheduled"
  priority: "low" | "medium" | "high"
  createdAt: Date
  scheduledFor?: Date
  isRecurring?: boolean
  recurringPattern?: "daily" | "weekly" | "monthly"
  attachments?: Attachment[]
  estimatedTime?: string
  category: "document" | "web-task" | "form" | "other"
}

interface ModelOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

export default function DashboardPage() {
  const { darkMode, setDarkMode } = useTheme()
  const router = useRouter()
  const { toast } = useToast()

  // Dialog state variables
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [openSignOutDialog, setOpenSignOutDialog] = useState(false)
  const [openClearRecurringDialog, setOpenClearRecurringDialog] = useState(false)
  const [openDeleteRecurringDialog, setOpenDeleteRecurringDialog] = useState(false)
  const [recurringTaskToDelete, setRecurringTaskToDelete] = useState<string | null>(null)
  const [openRestartTaskDialog, setOpenRestartTaskDialog] = useState(false)
  const [taskToRestart, setTaskToRestart] = useState<string | null>(null)

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Sign Rental Agreement",
      description: "Review and sign the rental agreement for the new apartment",
      status: "pending",
      priority: "high",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      category: "document",
      estimatedTime: "5 mins",
    },
    {
      id: "2",
      title: "Fill W-9 Tax Form",
      description: "Complete W-9 form for freelance client",
      status: "in-progress",
      priority: "medium",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      category: "form",
      estimatedTime: "10 mins",
    },
    {
      id: "3",
      title: "Weekly Expense Report",
      description: "Generate and submit weekly expense report",
      status: "scheduled",
      priority: "medium",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      isRecurring: true,
      recurringPattern: "weekly",
      category: "document",
      estimatedTime: "15 mins",
    },
    {
      id: "4",
      title: "Book Flight Tickets",
      description: "Find and book flight tickets for business trip",
      status: "completed",
      priority: "high",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      category: "web-task",
      estimatedTime: "20 mins",
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([])
  const settingsDropdownRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "in-progress" | "completed" | "scheduled">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const MAX_WORDS = 2048

  const modelOptions: ModelOption[] = [
    {
      id: "the-dump-fuck",
      name: "The Dump Fuck",
      description: "Basic, straightforward, and... direct.",
      icon: <Zap className="w-4 h-4 text-orange-500" />,
    },
    {
      id: "obeseius-destroyer-of-worlds",
      name: "Obeseius, Destroyer of Worlds",
      description: "For when you need ultimate power and cosmic understanding.",
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
    },
  ]

  const [selectedModel, setSelectedModel] = useState<string>("the-dump-fuck")
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)

  // Add new state for recurring tasks panel
  const [showRecurringPanel, setShowRecurringPanel] = useState(false)
  const [recurringTasks, setRecurringTasks] = useState([
    {
      id: "r1",
      title: "Weekly Expense Report",
      description: "Generate and submit weekly expense report",
      pattern: "weekly",
      dayOfWeek: 1, // Monday
      time: "09:00",
      isActive: true,
      nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "r2",
      title: "Monthly Invoice Processing",
      description: "Process and organize monthly invoices",
      pattern: "monthly",
      dayOfMonth: 1,
      time: "10:00",
      isActive: true,
      nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  ])

  const [newRecurringTask, setNewRecurringTask] = useState({
    title: "",
    description: "",
    pattern: "weekly" as "daily" | "weekly" | "monthly",
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: "09:00",
  })

  // Format date consistently to avoid hydration errors
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0].replace(/-/g, '/')
  }

  // Confirmation functions for dialogs
  const confirmDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId)
    setOpenDeleteDialog(true)
  }

  const deleteTaskConfirmed = () => {
    if (taskToDelete) {
      setTasks((prev) => prev.filter((task) => task.id !== taskToDelete))
      toast({
        title: "Task Deleted",
        description: "Task has been removed from your dashboard.",
      })
    }
    setOpenDeleteDialog(false)
    setTaskToDelete(null)
  }

  const confirmSignOut = () => {
    setOpenSignOutDialog(true)
  }

  const signOutConfirmed = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("username")
    router.push("/")
    setOpenSignOutDialog(false)
  }

  const confirmClearRecurring = () => {
    setOpenClearRecurringDialog(true)
  }

  const clearRecurringConfirmed = () => {
    setRecurringTasks([])
    toast({
      title: "Recurring Tasks Cleared",
      description: "All recurring tasks have been removed.",
    })
    setOpenClearRecurringDialog(false)
  }

  // Add confirmation for deleting individual recurring tasks
  const confirmDeleteRecurringTask = (taskId: string) => {
    setRecurringTaskToDelete(taskId)
    setOpenDeleteRecurringDialog(true)
  }

  const deleteRecurringTaskConfirmed = () => {
    if (recurringTaskToDelete) {
      setRecurringTasks((prev) => prev.filter((task) => task.id !== recurringTaskToDelete))
      toast({
        title: "Recurring Task Deleted",
        description: "Recurring task has been removed.",
      })
    }
    setOpenDeleteRecurringDialog(false)
    setRecurringTaskToDelete(null)
  }

  // Add confirmation for restarting tasks
  const confirmRestartTask = (taskId: string) => {
    setTaskToRestart(taskId)
    setOpenRestartTaskDialog(true)
  }

  const restartTaskConfirmed = () => {
    if (taskToRestart) {
      setTasks((prev) => prev.map((task) => (task.id === taskToRestart ? { ...task, status: "pending" as const } : task)))
      toast({
        title: "Task Restarted",
        description: "Task has been reset to pending status.",
      })
    }
    setOpenRestartTaskDialog(false)
    setTaskToRestart(null)
  }

  const handleSignOut = () => {
    confirmSignOut()
  }

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newAttachments: Attachment[] = Array.from(e.dataTransfer.files).map((file) => ({
        id: Date.now().toString() + Math.random().toString(),
        type: "file",
        name: file.name,
        fileType: file.type.split("/")[0],
      }))

      setPendingAttachments((prev) => [...prev, ...newAttachments])
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const words = value.trim().split(/\s+/).filter(Boolean)

    if (words.length <= MAX_WORDS) {
      setInputValue(value)
      setWordCount(words.length)
    } else {
      const truncatedText = words.slice(0, MAX_WORDS).join(" ")
      setInputValue(truncatedText)
      setWordCount(MAX_WORDS)
      toast({
        title: "Word limit reached",
        description: `Task descriptions are limited to ${MAX_WORDS} words.`,
      })
    }
  }

  const handleCreateTask = () => {
    if (!inputValue.trim()) return

    setIsCreatingTask(true)

    setTimeout(() => {
      const newTask: Task = {
        id: Date.now().toString(),
        title: inputValue.length > 50 ? inputValue.substring(0, 50) + "..." : inputValue,
        description: inputValue,
        status: "pending",
        priority: "medium",
        createdAt: new Date(),
        attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
        category: "other",
        estimatedTime: "5 mins",
      }

      setTasks((prev) => [newTask, ...prev])
      setInputValue("")
      setPendingAttachments([])
      setWordCount(0)
      setIsCreatingTask(false)

      toast({
        title: "Task Created",
        description: "Your task has been added to the dashboard.",
      })
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleCreateTask()
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: Date.now().toString() + Math.random().toString(),
      type: "file",
      name: file.name,
      fileType: file.type.split("/")[0],
    }))

    setPendingAttachments((prev) => [...prev, ...newAttachments])

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeAttachment = (attachmentId: string) => {
    setPendingAttachments((prev) => prev.filter((att) => att.id !== attachmentId))
  }

  // Audio recording functions
  const startRecording = () => {
    setIsRecording(true)
    setRecordingDuration(0)
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsProcessingAudio(true)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    setTimeout(() => {
      setIsProcessingAudio(false)
      const voiceAttachment: Attachment = {
        id: Date.now().toString(),
        type: "voice",
        name: "Voice message",
        duration: recordingDuration,
      }
      setPendingAttachments((prev) => [...prev, voiceAttachment])
      setRecordingDuration(0)
    }, 1500)
  }

  const cancelRecording = () => {
    setIsRecording(false)
    setRecordingDuration(0)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const updateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
    toast({
      title: "Task Updated",
      description: `Task status changed to ${newStatus}.`,
    })
  }

  const deleteTask = (taskId: string) => {
    confirmDeleteTask(taskId)
  }

  // Restart task function
  const restartTask = (taskId: string) => {
    confirmRestartTask(taskId)
  }

  // Add function to create recurring task
  const createRecurringTask = () => {
    if (!newRecurringTask.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a task title",
        variant: "destructive",
      })
      return
    }

    const nextRun = new Date()
    if (newRecurringTask.pattern === "daily") {
      nextRun.setDate(nextRun.getDate() + 1)
    } else if (newRecurringTask.pattern === "weekly") {
      const daysUntilNext = (newRecurringTask.dayOfWeek - nextRun.getDay() + 7) % 7 || 7
      nextRun.setDate(nextRun.getDate() + daysUntilNext)
    } else if (newRecurringTask.pattern === "monthly") {
      nextRun.setMonth(nextRun.getMonth() + 1)
      nextRun.setDate(newRecurringTask.dayOfMonth)
    }

    const [hours, minutes] = newRecurringTask.time.split(":")
    nextRun.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

    const recurringTask = {
      id: Date.now().toString(),
      ...newRecurringTask,
      isActive: true,
      nextRun,
    }

    setRecurringTasks((prev) => [...prev, recurringTask])
    setNewRecurringTask({
      title: "",
      description: "",
      pattern: "weekly",
      dayOfWeek: 1,
      dayOfMonth: 1,
      time: "09:00",
    })

    toast({
      title: "Recurring Task Created",
      description: "Your recurring task has been scheduled.",
    })
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4 text-amber-500" />
      case "in-progress":
        return <Play className="w-4 h-4 text-blue-500" />
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case "scheduled":
        return <Calendar className="w-4 h-4 text-purple-500" />
      default:
        return <Clock className="w-4 h-4 text-stone-500" />
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-amber-500"
      case "low":
        return "border-l-emerald-500"
      default:
        return "border-l-stone-300"
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filterStatus === "all" || task.status === filterStatus
    const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])

  return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors duration-300 flex flex-col">
        {/* Header */}
        <header className="border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 transition-colors duration-300 sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-7 h-7 bg-stone-800 dark:bg-stone-200 rounded-sm transition-colors duration-300"></div>
                  <span className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Shaman</span>
                </Link>
              </div>

              <div className="flex items-center space-x-3">
                {/* Model Selection Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs px-3 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-700"
                    >
                      {modelOptions.find((m) => m.id === selectedModel)?.icon}
                      <span className="ml-1.5 mr-1 hidden sm:inline">
                      {modelOptions.find((m) => m.id === selectedModel)?.name}
                    </span>
                      <ChevronDownIcon className="w-3 h-3 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                      align="end"
                      className="w-72 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                  >
                    <DropdownMenuLabel className="text-xs px-2 py-1.5 text-stone-500 dark:text-stone-400">
                      Select AI Model
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-stone-200 dark:bg-stone-700" />
                    {modelOptions.map((model) => (
                        <DropdownMenuItem
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`px-2 py-2 text-sm cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700 ${selectedModel === model.id ? "bg-stone-100 dark:bg-stone-700" : ""}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                {model.icon}
                                <span className="ml-2 font-medium text-stone-900 dark:text-stone-100">{model.name}</span>
                              </div>
                              <p className="ml-6 text-xs text-stone-500 dark:text-stone-400">{model.description}</p>
                            </div>
                            {selectedModel === model.id && (
                                <CheckCircle className="w-4 h-4 text-emerald-500 ml-2 flex-shrink-0" />
                            )}
                          </div>
                        </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDarkMode(!darkMode)}
                    className="h-8 w-8 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full"
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                {/* Settings Dropdown */}
                <div className="relative" ref={settingsDropdownRef}>
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                      className="h-8 w-8 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>

                  {showSettingsDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden z-10">
                        <div className="p-2">
                          <Link href="/profile">
                            <button className="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors duration-300">
                              <UserCircle className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                              <span className="text-sm text-stone-900 dark:text-stone-100">Profile</span>
                            </button>
                          </Link>
                          <Link href="/notifications">
                            <button className="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors duration-300">
                              <Bell className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                              <span className="text-sm text-stone-900 dark:text-stone-100">Notifications</span>
                            </button>
                          </Link>
                          <div className="border-t border-stone-200 dark:border-stone-700 my-1"></div>
                          <button
                              onClick={handleSignOut}
                              className="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors duration-300 text-red-600 dark:text-red-400"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Sign Out</span>
                          </button>
                        </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Dashboard Header */}
            <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-4 sm:px-6 lg:px-8 py-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-extralight text-stone-900 dark:text-stone-100 tracking-tight">
                      Task Dashboard
                    </h1>
                    <p className="text-stone-600 dark:text-stone-300 font-light mt-1">
                      Manage your paperwork and web tasks efficiently
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRecurringPanel(!showRecurringPanel)}
                        className={`h-10 px-3 rounded-xl transition-all duration-300 ${
                            showRecurringPanel ? "bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900" : ""
                        }`}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Recurring Tasks
                    </Button>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <Input
                          placeholder="Search tasks..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64 h-10 rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10 px-3 rounded-xl">
                          <Filter className="w-4 h-4 mr-2" />
                          {filterStatus === "all"
                              ? "All Tasks"
                              : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Tasks</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Pending</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("in-progress")}>In Progress</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("scheduled")}>Scheduled</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus("completed")}>Completed</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Task Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-stone-50 dark:bg-stone-700 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-stone-600 dark:text-stone-400">Pending</p>
                        <p className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
                          {tasks.filter((t) => t.status === "pending").length}
                        </p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-amber-500" />
                    </div>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-700 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-stone-600 dark:text-stone-400">In Progress</p>
                        <p className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
                          {tasks.filter((t) => t.status === "in-progress").length}
                        </p>
                      </div>
                      <Play className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-700 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-stone-600 dark:text-stone-400">Scheduled</p>
                        <p className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
                          {tasks.filter((t) => t.status === "scheduled").length}
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-700 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-stone-600 dark:text-stone-400">Completed</p>
                        <p className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
                          {tasks.filter((t) => t.status === "completed").length}
                        </p>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 bg-stone-50 dark:bg-stone-900">
              <div className="max-w-7xl mx-auto">
                <div className="space-y-4">
                  {filteredTasks.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-stone-400 dark:text-stone-500" />
                        </div>
                        <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">No tasks found</h3>
                        <p className="text-stone-600 dark:text-stone-400">
                          {searchQuery
                              ? "Try adjusting your search or filter."
                              : "Create your first task using the input below."}
                        </p>
                      </div>
                  ) : (
                      filteredTasks.map((task) => (
                          <div
                              key={task.id}
                              className={`fade-in bg-white dark:bg-stone-800 rounded-2xl border-l-4 ${getPriorityColor(task.priority)} border-r border-t border-b border-stone-200 dark:border-stone-700 p-6 hover:shadow-md transition-all duration-300`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                  {getStatusIcon(task.status)}
                                  <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 truncate">
                                    {task.title}
                                  </h3>
                                  <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          task.priority === "high"
                                              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                              : task.priority === "medium"
                                                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                                                  : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                                      }`}
                                  >
                              {task.priority}
                            </span>
                                </div>

                                <p className="text-stone-600 dark:text-stone-400 mb-4 leading-relaxed">{task.description}</p>

                                {task.attachments && task.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {task.attachments.map((attachment, index) => (
                                          <div
                                              key={index}
                                              className="flex items-center space-x-2 bg-stone-100 dark:bg-stone-700 px-3 py-1.5 rounded-lg"
                                          >
                                            {attachment.type === "voice" ? (
                                                <Mic className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                                            ) : attachment.fileType === "application" ? (
                                                <FileText className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                                            ) : (
                                                <ImageIcon className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                                            )}
                                            <span className="text-xs text-stone-900 dark:text-stone-100 truncate max-w-[120px]">
                                    {attachment.name}
                                  </span>
                                          </div>
                                      ))}
                                    </div>
                                )}

                                <div className="flex items-center space-x-4 text-xs text-stone-500 dark:text-stone-400">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Created {formatDate(task.createdAt)}</span>
                                  </div>
                                  {task.estimatedTime && (
                                      <div className="flex items-center space-x-1">
                                        <span>•</span>
                                        <span>{task.estimatedTime}</span>
                                      </div>
                                  )}
                                  {task.isRecurring && (
                                      <div className="flex items-center space-x-1">
                                        <RotateCcw className="w-3 h-3" />
                                        <span>{task.recurringPattern}</span>
                                      </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {task.status === "completed" && (
                                        <>
                                          <DropdownMenuItem onClick={() => restartTask(task.id)}>
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Restart Task
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                        </>
                                    )}
                                    <DropdownMenuItem
                                        onClick={() => deleteTask(task.id)}
                                        className="text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Task
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Task Creation Area */}
            <div className="border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 transition-colors duration-300">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Recording UI */}
                {isRecording && (
                    <div className="mb-4 bg-stone-100 dark:bg-stone-700 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                          <Mic className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-stone-900 dark:text-stone-100">Recording...</div>
                          <div className="text-xs text-stone-500 dark:text-stone-400">
                            {formatRecordingTime(recordingDuration)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelRecording}
                            className="h-8 w-8 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={stopRecording}
                            className="h-8 bg-stone-800 dark:bg-stone-200 hover:bg-stone-900 dark:hover:bg-stone-100 text-white dark:text-stone-900 rounded-full px-3"
                        >
                          <span className="text-xs font-medium">Stop</span>
                        </Button>
                      </div>
                    </div>
                )}

                {/* Processing Audio UI */}
                {isProcessingAudio && (
                    <div className="mb-4 bg-stone-100 dark:bg-stone-700 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-stone-900 dark:text-stone-100">Processing audio...</div>
                          <div className="text-xs text-stone-500 dark:text-stone-400">This may take a moment</div>
                        </div>
                      </div>
                    </div>
                )}

                {/* Pending Attachments */}
                {pendingAttachments.length > 0 && !isRecording && !isProcessingAudio && (
                    <div className="slide-up mb-4 bg-stone-100 dark:bg-stone-700 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Attachments</span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                      {pendingAttachments.length} item{pendingAttachments.length > 1 ? "s" : ""}
                    </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pendingAttachments.map((attachment) => (
                            <div
                                key={attachment.id}
                                className="flex items-center space-x-2 bg-white dark:bg-stone-800 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600"
                            >
                              {attachment.type === "voice" ? (
                                  <>
                                    <Mic className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                                    <span className="text-sm text-stone-900 dark:text-stone-100">
                              Voice ({formatRecordingTime(attachment.duration || 0)})
                            </span>
                                  </>
                              ) : attachment.fileType === "application" ? (
                                  <>
                                    <FileText className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                                    <span className="text-sm text-stone-900 dark:text-stone-100 truncate max-w-[120px]">
                              {attachment.name}
                            </span>
                                  </>
                              ) : (
                                  <>
                                    <ImageIcon className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                                    <span className="text-sm text-stone-900 dark:text-stone-100 truncate max-w-[120px]">
                              {attachment.name}
                            </span>
                                  </>
                              )}
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachment(attachment.id)}
                                  className="h-6 w-6 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-600 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                        ))}
                      </div>
                    </div>
                )}

                {/* Task Input Field */}
                {!isRecording && !isProcessingAudio && (
                    <div
                        className={`relative ${isDragging ? "ring-2 ring-stone-400 dark:ring-stone-500 bg-stone-100 dark:bg-stone-700 rounded-2xl" : ""}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                      <div className="flex items-end space-x-3">
                        <div className="flex-1 relative">
                          <Input
                              value={inputValue}
                              onChange={handleInputChange}
                              onKeyPress={handleKeyPress}
                              placeholder="Tell Shaman what task you need done..."
                              disabled={isCreatingTask}
                              className="pr-20 py-4 pl-4 text-base rounded-2xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300 min-h-[56px] resize-none"
                          />
                          {wordCount > 0 && (
                              <div className="absolute left-4 bottom-[-22px] text-xs text-stone-500 dark:text-stone-400">
                                {wordCount}/{MAX_WORDS} words
                              </div>
                          )}
                          <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                            <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" multiple />
                            <Button
                                onClick={handleFileUpload}
                                variant="ghost"
                                size="icon"
                                disabled={isCreatingTask}
                                className="h-8 w-8 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-600"
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={handleCreateTask}
                                disabled={(!inputValue.trim() && pendingAttachments.length === 0) || isCreatingTask}
                                className="h-8 w-8 rounded-full bg-stone-800 dark:bg-stone-200 hover:bg-stone-900 dark:hover:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCreatingTask ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        {/* Voice Recording Button */}
                        <Button
                            onClick={startRecording}
                            variant="outline"
                            size="icon"
                            disabled={isCreatingTask}
                            className="h-14 w-14 rounded-2xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-600 hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-300"
                        >
                          <Mic className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Input Hint */}
                      <div className="mt-6 text-center">
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          Press <kbd className="px-1.5 py-0.5 text-xs bg-stone-200 dark:bg-stone-700 rounded">Enter</kbd> to
                          create task • Click mic to record voice description • Drag & drop files to attach
                        </p>
                      </div>

                      {/* Drag overlay */}
                      {isDragging && (
                          <div className="absolute inset-0 bg-stone-800/20 dark:bg-stone-200/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 shadow-lg border border-stone-200 dark:border-stone-700">
                              <Paperclip className="w-8 h-8 text-stone-600 dark:text-stone-400 mx-auto mb-2" />
                              <p className="text-stone-900 dark:text-stone-100 font-medium">Drop files to attach</p>
                            </div>
                          </div>
                      )}
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Recurring Tasks Panel */}
        {showRecurringPanel && (
            <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-stone-800 border-l border-stone-200 dark:border-stone-700 shadow-xl z-20 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Recurring Tasks</h2>
                  <div className="flex space-x-2">
                    {recurringTasks.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={confirmClearRecurring}
                            className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                        >
                          Clear All
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowRecurringPanel(false)}
                        className="h-8 w-8 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Create New Recurring Task */}
                <div className="bg-stone-50 dark:bg-stone-700 rounded-xl p-4 mb-6">
                  <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-4">Create New Recurring Task</h3>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">Task Title</Label>
                      <Input
                          placeholder="Enter task title"
                          value={newRecurringTask.title}
                          onChange={(e) => setNewRecurringTask((prev) => ({ ...prev, title: e.target.value }))}
                          className="h-9 text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">Description</Label>
                      <Input
                          placeholder="Enter description"
                          value={newRecurringTask.description}
                          onChange={(e) => setNewRecurringTask((prev) => ({ ...prev, description: e.target.value }))}
                          className="h-9 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">Pattern</Label>
                        <select
                            value={newRecurringTask.pattern}
                            onChange={(e) =>
                                setNewRecurringTask((prev) => ({
                                  ...prev,
                                  pattern: e.target.value as "daily" | "weekly" | "monthly",
                                }))
                            }
                            className="w-full h-9 text-sm rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-3"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">Time</Label>
                        <Input
                            type="time"
                            value={newRecurringTask.time}
                            onChange={(e) => setNewRecurringTask((prev) => ({ ...prev, time: e.target.value }))}
                            className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    {newRecurringTask.pattern === "weekly" && (
                        <div>
                          <Label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">Day of Week</Label>
                          <select
                              value={newRecurringTask.dayOfWeek}
                              onChange={(e) =>
                                  setNewRecurringTask((prev) => ({
                                    ...prev,
                                    dayOfWeek: Number.parseInt(e.target.value),
                                  }))
                              }
                              className="w-full h-9 text-sm rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-3"
                          >
                            <option value={1}>Monday</option>
                            <option value={2}>Tuesday</option>
                            <option value={3}>Wednesday</option>
                            <option value={4}>Thursday</option>
                            <option value={5}>Friday</option>
                            <option value={6}>Saturday</option>
                            <option value={0}>Sunday</option>
                          </select>
                        </div>
                    )}

                    {newRecurringTask.pattern === "monthly" && (
                        <div>
                          <Label className="text-xs text-stone-600 dark:text-stone-400 mb-1 block">Day of Month</Label>
                          <Input
                              type="number"
                              min="1"
                              max="31"
                              value={newRecurringTask.dayOfMonth}
                              onChange={(e) =>
                                  setNewRecurringTask((prev) => ({
                                    ...prev,
                                    dayOfMonth: Number.parseInt(e.target.value) || 1,
                                  }))
                              }
                              className="h-9 text-sm"
                          />
                        </div>
                    )}

                    <Button
                        onClick={createRecurringTask}
                        className="w-full h-9 bg-stone-800 dark:bg-stone-200 hover:bg-stone-900 dark:hover:bg-stone-100 text-white dark:text-stone-900 text-sm"
                    >
                      Create Recurring Task
                    </Button>
                  </div>
                </div>

                {/* Existing Recurring Tasks */}
                <div>
                  <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-4">Active Recurring Tasks</h3>

                  {recurringTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <RotateCcw className="w-8 h-8 text-stone-400 dark:text-stone-500 mx-auto mb-2" />
                        <p className="text-sm text-stone-600 dark:text-stone-400">No recurring tasks yet</p>
                      </div>
                  ) : (
                      <div className="space-y-3">
                        {recurringTasks.map((task) => (
                            <div
                                key={task.id}
                                className="bg-white dark:bg-stone-700 rounded-lg border border-stone-200 dark:border-stone-600 p-4"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100">{task.title}</h4>
                                <div className="flex items-center space-x-1">
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                          setRecurringTasks((prev) =>
                                              prev.map((t) => (t.id === task.id ? { ...t, isActive: !t.isActive } : t)),
                                          )
                                      }
                                      className="h-6 w-6 rounded-full p-0"
                                  >
                                    {task.isActive ? (
                                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                                    ) : (
                                        <X className="h-3 w-3 text-stone-400" />
                                    )}
                                  </Button>
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => confirmDeleteRecurringTask(task.id)}
                                      className="h-6 w-6 rounded-full p-0 text-red-500 hover:text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <p className="text-xs text-stone-600 dark:text-stone-400 mb-3">{task.description}</p>

                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-stone-100 dark:bg-stone-600 rounded text-stone-700 dark:text-stone-300">
                            {task.pattern}
                          </span>
                                  <span className="text-stone-500 dark:text-stone-400">{task.time}</span>
                                </div>
                                <div className="text-stone-500 dark:text-stone-400">
                                  Next: {formatDate(task.nextRun)}
                                </div>
                              </div>
                            </div>
                        ))}
                      </div>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* Overlay for recurring panel */}
        {showRecurringPanel && (
            <div
                className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-10"
                onClick={() => setShowRecurringPanel(false)}
            ></div>
        )}

        {/* Delete Task Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
              <div className="flex gap-2 w-full justify-end">
                <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={deleteTaskConfirmed}>
                  Delete
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sign Out Confirmation Dialog */}
        <Dialog open={openSignOutDialog} onOpenChange={setOpenSignOutDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sign Out</DialogTitle>
              <DialogDescription>
                Are you sure you want to sign out of your account?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
              <div className="flex gap-2 w-full justify-end">
                <Button variant="outline" onClick={() => setOpenSignOutDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={signOutConfirmed}>
                  Sign Out
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear Recurring Tasks Confirmation Dialog */}
        <Dialog open={openClearRecurringDialog} onOpenChange={setOpenClearRecurringDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Clear Recurring Tasks</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove all recurring tasks? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
              <div className="flex gap-2 w-full justify-end">
                <Button variant="outline" onClick={() => setOpenClearRecurringDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={clearRecurringConfirmed}>
                  Clear All
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Recurring Task Confirmation Dialog */}
        <Dialog open={openDeleteRecurringDialog} onOpenChange={setOpenDeleteRecurringDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Recurring Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this recurring task? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
              <div className="flex gap-2 w-full justify-end">
                <Button variant="outline" onClick={() => setOpenDeleteRecurringDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={deleteRecurringTaskConfirmed}>
                  Delete
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Restart Task Confirmation Dialog */}
        <Dialog open={openRestartTaskDialog} onOpenChange={setOpenRestartTaskDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Restart Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to restart this task? It will be moved back to pending status.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
              <div className="flex gap-2 w-full justify-end">
                <Button variant="outline" onClick={() => setOpenRestartTaskDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={restartTaskConfirmed}>
                  Restart
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>)}