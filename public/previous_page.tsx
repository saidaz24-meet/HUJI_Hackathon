"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Sparkles,
  Zap,
  Loader2,
  LogOut,
  UserCircle,
  Bell,
  Mic,
  X,
  ChevronDownIcon,
  AlertCircle,
  Play,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  MicIcon,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/hooks/use-theme"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "../contexts/auth-context"
import { DatabaseService } from "@/lib/firebase/database"
import { VoiceTranscriptionService } from "@/lib/voice-transcription"
import { TaskOverviewDisplay } from "@/components/task-overview-display"
import { TaskListSkeleton } from "@/components/task-skeleton"
import type { Task, Attachment } from "@/types/database"

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
  const { user, signOut } = useAuth()

  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [isTaskInputFocused, setIsTaskInputFocused] = useState(false)
  const [openSignOutDialog, setOpenSignOutDialog] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)

  // Refs
  const settingsDropdownRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const voiceService = useRef<VoiceTranscriptionService | null>(null)

  const MAX_WORDS = 2048

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

  // Initialize voice service
  useEffect(() => {
    voiceService.current = new VoiceTranscriptionService()
  }, [])

  // Listen to tasks from Firebase
  useEffect(() => {
    if (!user) return

    const unsubscribe = DatabaseService.listenToUserTasks(user.uid, (userTasks) => {
      setTasks(userTasks)
      setIsLoadingTasks(false)
    })

    return unsubscribe
  }, [user])

  // Listen for task errors
  useEffect(() => {
    if (!user) return

    const unsubscribe = DatabaseService.listenToTaskErrors(user.uid, (errorTasks) => {
      errorTasks.forEach((task) => {
        if (task.is_error && task.errorMessage) {
          toast({
            title: "Task Error",
            description: task.errorMessage,
            variant: "destructive",
          })
        }
      })
    })

    return unsubscribe
  }, [user, toast])

  // Calculate task statistics
  const taskStats = {
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    scheduled: tasks.filter((t) => t.status === "scheduled").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }

  // Event handlers
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

  const handleCreateTask = async () => {
    if (!inputValue.trim() || !user) return

    setIsCreatingTask(true)

    try {
      await DatabaseService.createTask(user.uid, {
        title: inputValue.length > 50 ? inputValue.substring(0, 50) + "..." : inputValue,
        description: inputValue,
        status: "pending",
        priority: "medium",
        attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
        category: "other",
        estimatedTime: "5 mins",
      })

      setInputValue("")
      setPendingAttachments([])
      setWordCount(0)
      setIsTaskInputFocused(false)

      toast({
        title: "Task Created",
        description: "Your task has been added and is being processed.",
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

  const startRecording = async () => {
    if (!voiceService.current?.isRecognitionSupported()) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in your browser.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsRecording(true)
      setRecordingDuration(0)
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)

      await voiceService.current!.startRecording(
        (transcript, isFinal) => {
          if (isFinal) {
            setInputValue((prev) => prev + " " + transcript)
            const words = (inputValue + " " + transcript).trim().split(/\s+/).filter(Boolean)
            setWordCount(words.length)
          }
        },
        (error) => {
          console.error("Voice recognition error:", error)
          toast({
            title: "Voice Recognition Error",
            description: "Failed to process voice input.",
            variant: "destructive",
          })
        },
      )
    } catch (error) {
      console.error("Failed to start recording:", error)
      setIsRecording(false)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsProcessingAudio(true)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    voiceService.current?.stopRecording()

    setTimeout(() => {
      setIsProcessingAudio(false)
      setRecordingDuration(0)
    }, 1000)
  }

  const cancelRecording = () => {
    setIsRecording(false)
    setRecordingDuration(0)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    voiceService.current?.stopRecording()
  }

  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const handleOverviewClick = (status: string) => {
    router.push(`/dashboard/${status}`)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
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

  // Cleanup
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
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-2 flex-shrink-0" />
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
                        onClick={() => setOpenSignOutDialog(true)}
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

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Main Task Creation Area - This is now the primary focus */}
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
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                          <MicIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-lg font-medium text-red-900 dark:text-red-100">Recording...</div>
                          <div className="text-sm text-red-700 dark:text-red-300">
                            {formatRecordingTime(recordingDuration)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelRecording}
                          className="h-10 w-10 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={stopRecording}
                          className="h-10 bg-red-600 hover:bg-red-700 text-white rounded-full px-6"
                        >
                          <span className="text-sm font-medium">Stop Recording</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Processing Audio UI */}
                  {isProcessingAudio && (
                    <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 flex items-center justify-between border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                        <div>
                          <div className="text-lg font-medium text-amber-900 dark:text-amber-100">
                            Processing audio...
                          </div>
                          <div className="text-sm text-amber-700 dark:text-amber-300">Converting speech to text</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Task Input */}
                  {!isRecording && !isProcessingAudio && (
                    <div
                      className={`relative transition-all duration-500 ${
                        isTaskInputFocused ? "transform scale-[1.02]" : ""
                      } ${isDragging ? "ring-4 ring-stone-400 dark:ring-stone-500 bg-stone-100 dark:bg-stone-700 rounded-3xl" : ""}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex items-end space-x-4">
                        <div className="flex-1 relative">
                          <Input
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            onFocus={() => setIsTaskInputFocused(true)}
                            onBlur={() => setIsTaskInputFocused(false)}
                            placeholder="Describe your task in detail..."
                            disabled={isCreatingTask}
                            className={`pr-28 py-8 pl-8 text-xl rounded-3xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-4 focus:ring-stone-800/20 dark:focus:ring-stone-200/20 focus:border-stone-800 dark:focus:border-stone-200 transition-all duration-300 min-h-[80px] shadow-lg ${
                              isTaskInputFocused ? "shadow-2xl border-stone-400 dark:border-stone-500" : ""
                            }`}
                          />
                          {wordCount > 0 && (
                            <div className="absolute left-8 bottom-[-36px] text-sm text-stone-500 dark:text-stone-400">
                              {wordCount}/{MAX_WORDS} words
                            </div>
                          )}
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                            <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" multiple />
                            <Button
                              onClick={handleFileUpload}
                              variant="ghost"
                              size="icon"
                              disabled={isCreatingTask}
                              className="h-10 w-10 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-600 flex items-center justify-center"
                            >
                              <Paperclip className="h-5 w-5" />
                            </Button>
                            <Button
                              onClick={handleCreateTask}
                              disabled={(!inputValue.trim() && pendingAttachments.length === 0) || isCreatingTask}
                              className="h-12 w-12 rounded-full bg-gradient-to-r from-stone-800 to-stone-700 dark:from-stone-200 dark:to-stone-300 hover:from-stone-900 hover:to-stone-800 dark:hover:from-stone-100 dark:hover:to-stone-200 text-white dark:text-stone-900 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                              {isCreatingTask ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                              ) : (
                                <Send className="h-6 w-6" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Voice Recording Button */}
                        <Button
                          onClick={startRecording}
                          variant="outline"
                          size="icon"
                          disabled={isCreatingTask}
                          className="h-20 w-20 rounded-3xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-stone-100 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                        >
                          <Mic className="h-8 w-8" />
                        </Button>
                      </div>

                      {/* Attachments Display */}
                      {pendingAttachments.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {pendingAttachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center space-x-2 bg-stone-100 dark:bg-stone-700 rounded-lg px-3 py-2"
                            >
                              <Paperclip className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                              <span className="text-sm text-stone-700 dark:text-stone-300">{attachment.name}</span>
                              <Button
                                onClick={() => removeAttachment(attachment.id)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 rounded-full p-0 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Input Hint */}
                      <div className="mt-8 text-center">
                        <p className="text-lg text-stone-500 dark:text-stone-400">
                          Press <kbd className="px-3 py-1 text-sm bg-stone-200 dark:bg-stone-700 rounded-lg">Enter</kbd>{" "}
                          to create task • Click mic to record voice • Drag & drop files to attach
                        </p>
                      </div>

                      {/* Drag overlay */}
                      {isDragging && (
                        <div className="absolute inset-0 bg-stone-800/20 dark:bg-stone-200/20 rounded-3xl backdrop-blur-sm flex items-center justify-center">
                          <div className="bg-white dark:bg-stone-800 rounded-2xl p-8 shadow-2xl border border-stone-200 dark:border-stone-700">
                            <Paperclip className="w-12 h-12 text-stone-600 dark:text-stone-400 mx-auto mb-4" />
                            <p className="text-stone-900 dark:text-stone-100 font-medium text-xl">
                              Drop files to attach
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right side - Task Overview Display */}
                <div className="w-full xl:w-96 flex-shrink-0">
                  <TaskOverviewDisplay taskStats={taskStats} onSegmentClick={handleOverviewClick} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tasks Section - Moved to bottom */}
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
                  {tasks.slice(0, 6).map((task) => (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {task.status === "pending" && <AlertCircle className="w-4 h-4 text-amber-500" />}
                          {task.status === "in-progress" && <Play className="w-4 h-4 text-blue-500" />}
                          {task.status === "scheduled" && <Calendar className="w-4 h-4 text-purple-500" />}
                          {task.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2 line-clamp-1">
                        {task.title}
                      </h3>
                      <p className="text-stone-600 dark:text-stone-400 mb-4 leading-relaxed line-clamp-2 text-sm">
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                        {task.estimatedTime && <span>{task.estimatedTime}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={openSignOutDialog} onOpenChange={setOpenSignOutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>Are you sure you want to sign out of your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" onClick={() => setOpenSignOutDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSignOut}>Sign Out</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
