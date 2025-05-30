// app/dashboard/page.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskListSkeleton } from "@/components/task-skeleton"
import { TaskOverviewDisplay } from "@/components/task-overview-display"
import { useAuth } from "../contexts/auth-context"
import { useRouter } from "next/navigation"
import { DatabaseService } from "@/lib/firebase/database"
import { useToast } from "@/hooks/use-toast"
import type { Task, Attachment } from "@/types/database"

import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  MicIcon,
  Moon,
  Paperclip,
  Send,
  Sun,
  UserCircle,
  X,
  AlertCircle,
  MoreHorizontal,
  Calendar,
  Play,
  Trash2,
  Settings,
  ChevronDownIcon,
  Sparkles,
  Zap
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "@/hooks/use-theme"

// Maximum number of words for task input
const MAX_WORDS = 500

// Model options
interface ModelOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const { darkMode, setDarkMode } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const settingsDropdownRef = useRef<HTMLDivElement>(null)

  // State for tasks and UI
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [isTaskInputFocused, setIsTaskInputFocused] = useState(false)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [openSignOutDialog, setOpenSignOutDialog] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [openNeedInputDialog, setOpenNeedInputDialog] = useState(false)
  const [currentNeedInputTask, setCurrentNeedInputTask] = useState<Task | null>(null)

  // Recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)

  // Model selection
  const modelOptions: ModelOption[] = [
    {
      id: "shaman-light",
      name: "Shaman Light",
      description: "Fast and efficient for everyday tasks.",
      icon: <Zap className="w-4 h-4 text-orange-500" />,
    },
    {
      id: "shaman-pro",
      name: "Shaman Pro",
      description: "Advanced AI with enhanced capabilities and deeper understanding.",
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
    },
  ]
  const [selectedModel, setSelectedModel] = useState<string>("shaman-light")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Subscribe to tasks from Firebase
    const unsubscribe = DatabaseService.listenToUserTasks(user.uid, (userTasks) => {
      setTasks(userTasks)
      setIsLoadingTasks(false)

      // Check for tasks that need input
      const needInputTask = userTasks.find(task => task.status === "need-input")
      if (needInputTask && !openNeedInputDialog) {
        setCurrentNeedInputTask(needInputTask)
        setOpenNeedInputDialog(true)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [user, router, openNeedInputDialog])

  // Calculate task statistics
  const taskStats = {
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    scheduled: tasks.filter((t) => t.status === "scheduled").length,
    needInput: tasks.filter((t) => t.status === "need-input").length
  }

  // Update word count whenever input changes
  useEffect(() => {
    const words = inputValue.trim() === "" ? 0 : inputValue.trim().split(/\s+/).length
    setWordCount(words)
  }, [inputValue])

  // Handle click outside settings dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (recordingInterval) {
        clearInterval(recordingInterval)
      }
    }
  }, [recordingInterval])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const words = value.trim() === "" ? 0 : value.trim().split(/\s+/).length

    if (words <= MAX_WORDS) {
      setInputValue(value)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleCreateTask()
    }
  }

  const handleCreateTask = async () => {
    if ((!inputValue.trim() && pendingAttachments.length === 0) || isCreatingTask) {
      return
    }

    setIsCreatingTask(true)

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      const description = inputValue.trim()
      const category = determineTaskCategory(description)
      const priority = determineTaskPriority(description)
      const title = generateTaskTitle(description)

      await DatabaseService.createTask(user.uid, {
        title,
        description,
        status: "pending",
        priority,
        category,
        attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
        model: selectedModel
      })

      setInputValue("")
      setPendingAttachments([])
      toast({
        title: "Task Created",
        description: "Your task has been submitted for processing.",
      })
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTask(false)
    }
  }

  const determineTaskCategory = (input: string): Task["category"] => {
    const lowerInput = input.toLowerCase()

    if (
        lowerInput.includes("document") ||
        lowerInput.includes("file") ||
        lowerInput.includes("pdf") ||
        lowerInput.includes("doc") ||
        lowerInput.includes("spreadsheet") ||
        lowerInput.includes("excel") ||
        lowerInput.includes("xls")
    ) {
      return "document"
    }

    if (
        lowerInput.includes("website") ||
        lowerInput.includes("online") ||
        lowerInput.includes("web") ||
        lowerInput.includes("url") ||
        lowerInput.includes("http") ||
        lowerInput.includes("search")
    ) {
      return "web-task"
    }

    if (
        lowerInput.includes("form") ||
        lowerInput.includes("application") ||
        lowerInput.includes("fill") ||
        lowerInput.includes("submit") ||
        lowerInput.includes("questionnaire") ||
        lowerInput.includes("survey")
    ) {
      return "form"
    }

    return "other"
  }

  const determineTaskPriority = (input: string): Task["priority"] => {
    const lowerInput = input.toLowerCase()

    if (
        lowerInput.includes("urgent") ||
        lowerInput.includes("asap") ||
        lowerInput.includes("immediately") ||
        lowerInput.includes("critical") ||
        lowerInput.includes("high priority")
    ) {
      return "high"
    }

    if (lowerInput.includes("soon") || lowerInput.includes("important")) {
      return "medium"
    }

    return "low"
  }

  const generateTaskTitle = (description: string): string => {
    // Generate a title based on the first few words, max 50 chars
    const words = description.split(/\s+/)
    let title = words.slice(0, 6).join(" ")
    if (title.length > 50) {
      title = title.substring(0, 47) + "..."
    }
    return title || "New Task"
  }

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments: Attachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      newAttachments.push({
        id: `attachment-${Date.now()}-${i}`,
        name: file.name,
        type: "file",
        fileType: file.type,
        url: URL.createObjectURL(file)
      })
    }

    setPendingAttachments((prev) => [...prev, ...newAttachments])

    // Reset the input to allow the same file to be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((attachment) => attachment.id !== id))
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
        id: `attachment-${Date.now()}-${Math.random()}`,
        type: "file",
        name: file.name,
        fileType: file.type,
        url: URL.createObjectURL(file)
      }))

      setPendingAttachments((prev) => [...prev, ...newAttachments])
    }
  }, [])

  const handleOverviewClick = (status: string) => {
    router.push(`/dashboard/${status}`)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return

    try {
      await DatabaseService.deleteTask(user.uid, taskId)
      toast({
        title: "Task Deleted",
        description: "Task has been removed.",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      })
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingDuration(0)

    // Start a timer to track recording duration
    const interval = setInterval(() => {
      setRecordingDuration((prev) => prev + 1)
    }, 1000)

    setRecordingInterval(interval)

    // In a real app, you would start actual audio recording here
  }

  const stopRecording = () => {
    if (recordingInterval) {
      clearInterval(recordingInterval)
      setRecordingInterval(null)
    }
    setIsRecording(false)
    setIsProcessingAudio(true)

    // Simulate processing delay
    setTimeout(() => {
      setIsProcessingAudio(false)
      // In a real app, you would get the transcription here
      const transcription = "This is a simulated voice transcription for demo purposes."
      setInputValue(transcription)
    }, 2000)
  }

  const cancelRecording = () => {
    if (recordingInterval) {
      clearInterval(recordingInterval)
      setRecordingInterval(null)
    }
    setIsRecording(false)
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      })
    }
  }

  const handleProvideProfileData = async () => {
    if (!currentNeedInputTask || !user) return

    try {
      // In a real implementation, you would collect the needed profile data
      // from the user interface. For now, we'll just mock it.
      const neededData = currentNeedInputTask.neededData || []
      const profileData: Record<string, string> = {}

      // Extract needed fields from user profile
      neededData.forEach(field => {
        if (field === "displayName") profileData[field] = user.displayName || ""
        else if (field === "email") profileData[field] = user.email || ""
        else if (field === "photoURL") profileData[field] = user.photoURL || ""
        // Add more fields as needed
      })

      // Update the task status back to in-progress
      await DatabaseService.updateTaskStatus(user.uid, currentNeedInputTask.id, "in-progress", profileData)

      setOpenNeedInputDialog(false)
      setCurrentNeedInputTask(null)

      toast({
        title: "Profile Data Provided",
        description: "Your task will continue processing.",
      })
    } catch (error) {
      console.error("Error providing profile data:", error)
      toast({
        title: "Error",
        description: "Failed to provide profile data. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-800 transition-colors duration-300">
        {/* Header */}
        <header className="border-b border-stone-200/50 dark:border-stone-700/50 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm transition-colors duration-300 sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-stone-800 to-stone-600 dark:from-stone-200 dark:to-stone-400 rounded-lg transition-colors duration-300"></div>
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
                            className="px-2 py-2 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700"
                            onClick={() => setSelectedModel(model.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="mt-0.5">{model.icon}</div>
                            <div>
                              <div className="text-sm font-medium text-stone-900 dark:text-stone-100">{model.name}</div>
                              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{model.description}</div>
                            </div>
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
                            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-700">
                              <UserCircle className="h-4 w-4" />
                              <span className="text-sm">Profile</span>
                            </div>
                          </Link>
                          <Link href="/notifications">
                            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-700">
                              <Bell className="h-4 w-4" />
                              <span className="text-sm">Notifications</span>
                            </div>
                          </Link>
                          <div className="border-t border-stone-200 dark:border-stone-700 my-1"></div>
                          <button
                              onClick={() => setOpenSignOutDialog(true)}
                              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-700"
                          >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm">Sign out</span>
                          </button>
                        </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Main Task Creation Area */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
              <div className="w-full max-w-7xl">
                {/* Welcome Header */}
                <div className="text-center mb-12">
                  <h1 className="text-5xl font-extralight text-stone-900 dark:text-stone-100 tracking-tight mb-4">
                    What can I help you with?
                  </h1>
                  <p className="text-xl text-stone-600 dark:text-stone-300 font-light max-w-2xl mx-auto">
                    Describe any task, document, or web activity you need done. I'll handle the rest.
                  </p>
                </div>

                {/* Task Input and Overview Layout */}
                <div className="flex flex-col xl:flex-row items-start gap-12 mb-12">
                  {/* Left side - Task Input (Primary) */}
                  <div className="flex-1 w-full">
                    {/* Recording UI */}
                    {isRecording && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 flex items-center justify-between border border-red-200 dark:border-red-800">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                                <div className="animate-pulse w-5 h-5 bg-red-500 rounded-full"></div>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-red-800 dark:text-red-200">Recording...</div>
                              <div className="text-xs text-red-600 dark:text-red-300">{formatRecordingTime(recordingDuration)}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelRecording}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
                            >
                              Cancel
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={stopRecording}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                    )}

                    {/* Processing Audio UI */}
                    {isProcessingAudio && (
                        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 flex items-center justify-between border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-amber-800 dark:text-amber-200">Processing audio...</div>
                              <div className="text-xs text-amber-600 dark:text-amber-300">This will just take a moment</div>
                            </div>
                          </div>
                        </div>
                    )}

                    {/* Main Task Input */}
                    {!isRecording && !isProcessingAudio && (
                        <div
                            className={`relative transition-all duration-500 ${
                                isTaskInputFocused || pendingAttachments.length > 0
                                    ? "bg-white dark:bg-stone-800 shadow-xl border-0 rounded-2xl p-6"
                                    : "bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm shadow-lg border border-stone-200/50 dark:border-stone-700/50 rounded-2xl p-6"
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                          <div className="flex items-end space-x-4">
                            <div className="flex-1">
                              <Input
                                  type="text"
                                  value={inputValue}
                                  onChange={handleInputChange}
                                  onKeyDown={handleKeyPress}
                                  onFocus={() => setIsTaskInputFocused(true)}
                                  onBlur={() => setIsTaskInputFocused(false)}
                                  placeholder="Describe what you need done..."
                                  className="flex h-12 w-full rounded-xl border-0 bg-white/50 dark:bg-stone-700/50 backdrop-blur-sm px-4 py-3 text-base shadow-inner shadow-stone-200 dark:shadow-stone-900 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                              <div className="mt-2 flex justify-between">
                                <div className="text-xs text-stone-500 dark:text-stone-400">
                                  {wordCount}/{MAX_WORDS} words
                                </div>
                                {pendingAttachments.length > 0 && (
                                    <div className="text-xs text-stone-500 dark:text-stone-400">
                                      {pendingAttachments.length} attachment{pendingAttachments.length !== 1 ? "s" : ""}
                                    </div>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  onClick={handleFileUpload}
                                  className="h-12 w-12 rounded-xl border-stone-200 dark:border-stone-700"
                              >
                                <Paperclip className="h-5 w-5" />
                                <span className="sr-only">Attach file</span>
                              </Button>
                              <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={onFileChange}
                                  multiple
                                  style={{ display: "none" }}
                              />
                              <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  onClick={startRecording}
                                  className="h-12 w-12 rounded-xl border-stone-200 dark:border-stone-700"
                              >
                                <MicIcon className="h-5 w-5" />
                                <span className="sr-only">Record audio</span>
                              </Button>
                              <Button
                                  type="button"
                                  size="icon"
                                  onClick={handleCreateTask}
                                  disabled={(!inputValue.trim() && pendingAttachments.length === 0) || isCreatingTask}
                                  className="h-12 w-12 rounded-xl bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600"
                              >
                                {isCreatingTask ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                                <span className="sr-only">Send</span>
                              </Button>
                            </div>
                          </div>

                          {/* Attachments Display */}
                          {pendingAttachments.length > 0 && (
                              <div className="mt-4 space-y-2">
                                <div className="text-sm font-medium text-stone-900 dark:text-stone-100">Attachments</div>
                                <div className="flex flex-wrap gap-2">
                                  {pendingAttachments.map((attachment) => (
                                      <div
                                          key={attachment.id}
                                          className="flex items-center space-x-2 bg-stone-100 dark:bg-stone-700 rounded-lg px-3 py-1.5"
                                      >
                                        <Paperclip className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                                        <span className="text-sm text-stone-700 dark:text-stone-300 max-w-[200px] truncate">
                                  {attachment.name}
                                </span>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => removeAttachment(attachment.id)}
                                            className="h-5 w-5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-600 p-0"
                                        >
                                          <X className="h-3 w-3" />
                                          <span className="sr-only">Remove</span>
                                        </Button>
                                      </div>
                                  ))}
                                </div>
                              </div>
                          )}

                          {/* Input Hint */}
                          <div className="mt-8 text-center">
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              Press Enter to send or drag files here to attach
                            </p>
                          </div>

                          {/* Drag overlay */}
                          {isDragging && (
                              <div className="absolute inset-0 bg-stone-800/10 dark:bg-stone-300/10 backdrop-blur-sm rounded-2xl border-2 border-dashed border-stone-400 dark:border-stone-500 flex items-center justify-center">
                                <div className="text-center">
                                  <Paperclip className="h-10 w-10 text-stone-600 dark:text-stone-400 mx-auto mb-4" />
                                  <p className="text-lg font-medium text-stone-600 dark:text-stone-400">Drop files to attach</p>
                                </div>
                              </div>
                          )}
                        </div>
                    )}
                  </div>

                  {/* Right side - Task Overview Display */}
                  <div className="w-full xl:w-96 flex-shrink-0">
                    {/* Task Overview Cards */}
                    <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
                      <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-6">Task Overview</h2>
                      <div className="space-y-4">
                        <div
                            onClick={() => handleOverviewClick("pending")}
                            className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 cursor-pointer transition-transform hover:scale-[1.02] border border-amber-100 dark:border-amber-800/40"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-800/60 rounded-full flex items-center justify-center">
                                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                              </div>
                              <span className="font-medium text-amber-800 dark:text-amber-300">Pending</span>
                            </div>
                            <span className="text-xl font-bold text-amber-800 dark:text-amber-300">{taskStats.pending}</span>
                          </div>
                        </div>
                        <div
                            onClick={() => handleOverviewClick("in-progress")}
                            className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 cursor-pointer transition-transform hover:scale-[1.02] border border-blue-100 dark:border-blue-800/40"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/60 rounded-full flex items-center justify-center">
                                <Play className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                              </div>
                              <span className="font-medium text-blue-800 dark:text-blue-300">In Progress</span>
                            </div>
                            <span className="text-xl font-bold text-blue-800 dark:text-blue-300">{taskStats.inProgress}</span>
                          </div>
                        </div>
                        <div
                            onClick={() => handleOverviewClick("need-input")}
                            className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 cursor-pointer transition-transform hover:scale-[1.02] border border-red-100 dark:border-red-800/40"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-red-100 dark:bg-red-800/60 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
                              </div>
                              <span className="font-medium text-red-800 dark:text-red-300">Need Input</span>
                            </div>
                            <span className="text-xl font-bold text-red-800 dark:text-red-300">{taskStats.needInput}</span>
                          </div>
                        </div>
                        <div
                            onClick={() => handleOverviewClick("scheduled")}
                            className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 cursor-pointer transition-transform hover:scale-[1.02] border border-purple-100 dark:border-purple-800/40"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800/60 rounded-full flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                              </div>
                              <span className="font-medium text-purple-800 dark:text-purple-300">Scheduled</span>
                            </div>
                            <span className="text-xl font-bold text-purple-800 dark:text-purple-300">{taskStats.scheduled}</span>
                          </div>
                        </div>
                        <div
                            onClick={() => handleOverviewClick("completed")}
                            className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 cursor-pointer transition-transform hover:scale-[1.02] border border-emerald-100 dark:border-emerald-800/40"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800/60 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                              </div>
                              <span className="font-medium text-emerald-800 dark:text-emerald-300">Completed</span>
                            </div>
                            <span className="text-xl font-bold text-emerald-800 dark:text-emerald-300">{taskStats.completed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Tasks Section */}
            <div className="bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm border-t border-stone-200/50 dark:border-stone-700/50 px-4 sm:px-6 lg:px-8 py-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-light text-stone-900 dark:text-stone-100">Recent Tasks</h2>
                  {tasks.length > 0 && (
                      <Link href="/dashboard/all">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                        >
                          View All
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                  )}
                </div>

                {isLoadingTasks ? (
                    <TaskListSkeleton count={3} />
                ) : tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-stone-400 dark:text-stone-500" />
                      </div>
                      <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">No tasks yet</h3>
                      <p className="text-stone-600 dark:text-stone-400">Create your first task using the input above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tasks
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, 6)
                          .map((task) => (
                              <div
                                  key={task.id}
                                  className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200/50 dark:border-stone-700/50 overflow-hidden hover:shadow-md transition-shadow duration-300"
                              >
                                <div className="p-4 flex flex-col h-full">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div
                                          className={`${getTaskStatusClass(
                                              task.status
                                          )} px-2 py-1 rounded-md text-xs font-medium capitalize flex items-center space-x-1`}
                                      >
                                        {task.status === "pending" && <Clock className="w-3 h-3" />}
                                        {task.status === "in-progress" && <Play className="w-3 h-3" />}
                                        {task.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                                        {task.status === "scheduled" && <Calendar className="w-3 h-3" />}
                                        {task.status === "need-input" && <AlertCircle className="w-3 h-3" />}
                                        <span>{formatTaskStatus(task.status)}</span>
                                      </div>
                                      <div
                                          className={`${getTaskPriorityClass(
                                              task.priority
                                          )} px-2 py-1 rounded-md text-xs font-medium capitalize`}
                                      >
                                        {task.priority}
                                      </div>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-stone-400 hover:text-stone-500 dark:text-stone-500 dark:hover:text-stone-400"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem asChild>
                                          <Link href={`/dashboard/task/${task.id}`} className="w-full cursor-pointer">
                                            View Details
                                          </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 cursor-pointer"
                                            onClick={() => handleDeleteTask(task.id)}
                                        >
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <h3 className="text-base font-medium text-stone-900 dark:text-stone-100 mb-1 line-clamp-1">{task.title}</h3>
                                  <p className="text-sm text-stone-600 dark:text-stone-400 mb-3 line-clamp-2">{task.description}</p>
                                  {task.progress !== undefined && task.status === "in-progress" && (
                                      <div className="w-full bg-stone-100 dark:bg-stone-700 rounded-full h-1.5 mb-3">
                                        <div
                                            className="bg-blue-500 h-1.5 rounded-full"
                                            style={{ width: `${task.progress}%` }}
                                        ></div>
                                      </div>
                                  )}
                                  <div className="mt-auto pt-2 flex items-center justify-between">
                                    <div className="text-xs text-stone-500 dark:text-stone-500">
                                      {formatRelativeTime(task.createdAt)}
                                    </div>
                                    {task.model && (
                                        <div className="flex items-center text-xs text-stone-500 dark:text-stone-500">
                                          {task.model === "shaman-light" ? (
                                              <Zap className="w-3 h-3 mr-1 text-orange-500" />
                                          ) : (
                                              <Sparkles className="w-3 h-3 mr-1 text-purple-500" />
                                          )}
                                          {task.model === "shaman-light" ? "Light" : "Pro"}
                                        </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                          ))}
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sign out confirmation dialog */}
        <Dialog open={openSignOutDialog} onOpenChange={setOpenSignOutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign Out</DialogTitle>
              <DialogDescription>Are you sure you want to sign out of your account?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenSignOutDialog(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleSignOut}>
                Sign out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Need Input Dialog */}
        {currentNeedInputTask && (
            <Dialog open={openNeedInputDialog} onOpenChange={setOpenNeedInputDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Profile Information Needed</DialogTitle>
                  <DialogDescription>
                    Additional information is needed to process your task. The system needs the following details from your profile:
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <ul className="list-disc pl-5 space-y-2">
                    {currentNeedInputTask.neededData?.map((field, index) => (
                        <li key={index} className="text-stone-700 dark:text-stone-300">
                          {formatFieldName(field)}
                        </li>
                    ))}
                  </ul>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenNeedInputDialog(false)}>
                    Later
                  </Button>
                  <Button onClick={handleProvideProfileData}>
                    Provide Information
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        )}
      </div>
  )
}

// Helper functions

function getTaskStatusClass(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
    case "in-progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    case "completed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
    case "scheduled":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
    case "need-input":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    default:
      return "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300"
  }
}

function getTaskPriorityClass(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    case "medium":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
    case "low":
      return "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300"
    default:
      return "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300"
  }
}

function formatTaskStatus(status: string): string {
  switch (status) {
    case "in-progress":
      return "In Progress"
    case "need-input":
      return "Need Input"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) {
    return "just now"
  } else if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

function formatFieldName(field: string): string {
  // Convert camelCase to Title Case with spaces
  const formatted = field.replace(/([A-Z])/g, ' $1').trim()
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}