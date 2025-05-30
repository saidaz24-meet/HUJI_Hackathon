"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  Play,
  Calendar,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Paperclip,
  User,
  BarChart3,
} from "lucide-react"
import type { Task } from "@/types/database"

interface ExpandableTaskCardProps {
  task: Task
  onDelete: (taskId: string) => void
  borderColor?: string
}

const STATUS_ICONS = {
  pending: AlertCircle,
  "in-progress": Play,
  scheduled: Calendar,
  completed: CheckCircle2,
}

const STATUS_COLORS = {
  pending: "amber",
  "in-progress": "blue",
  scheduled: "purple",
  completed: "emerald",
}

export function ExpandableTaskCard({ task, onDelete, borderColor }: ExpandableTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const StatusIcon = STATUS_ICONS[task.status]
  const statusColor = STATUS_COLORS[task.status]

  const handleExpand = async () => {
    if (!isExpanded) {
      setIsLoadingDetails(true)
      // Simulate loading time for fetching additional details
      await new Promise((resolve) => setTimeout(resolve, 800))
      setIsLoadingDetails(false)
    }
    setIsExpanded(!isExpanded)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-emerald-500"
    if (progress >= 50) return "bg-blue-500"
    if (progress >= 25) return "bg-amber-500"
    return "bg-stone-400"
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-600 dark:text-emerald-400"
      case "in-progress":
        return "text-blue-600 dark:text-blue-400"
      default:
        return "text-stone-500 dark:text-stone-400"
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case "in-progress":
        return <Play className="w-4 h-4 text-blue-500" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-stone-300 dark:border-stone-600" />
    }
  }

  return (
    <div
      className={`bg-white dark:bg-stone-800 rounded-2xl border-l-4 ${
        borderColor || `border-l-${statusColor}-500`
      } border-r border-t border-b border-stone-200 dark:border-stone-700 transition-all duration-300 ${
        isExpanded ? "shadow-lg" : "hover:shadow-md"
      }`}
    >
      {/* Main Task Content */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <StatusIcon className={`w-4 h-4 text-${statusColor}-500`} />
              <h3
                className={`text-lg font-medium text-stone-900 dark:text-stone-100 truncate ${
                  task.status === "completed" ? "line-through decoration-emerald-500/50" : ""
                }`}
              >
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

            <p className="text-stone-600 dark:text-stone-400 mb-4 leading-relaxed line-clamp-2">{task.description}</p>

            {/* Progress Bar */}
            {task.progress !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Progress</span>
                  <span className="text-sm text-stone-500 dark:text-stone-400">{task.progress}%</span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(task.progress)}`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="flex items-center space-x-4 text-xs text-stone-500 dark:text-stone-400">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              {task.estimatedTime && (
                <div className="flex items-center space-x-1">
                  <span>•</span>
                  <span>{task.estimatedTime}</span>
                </div>
              )}
              {task.steps && (
                <div className="flex items-center space-x-1">
                  <span>•</span>
                  <span>
                    {task.steps.filter((s) => s.status === "completed").length}/{task.steps.length} steps
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpand}
              className="h-8 w-8 rounded-full text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600 dark:text-red-400">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-stone-200 dark:border-stone-700 p-6 bg-stone-50 dark:bg-stone-800/50">
          {isLoadingDetails ? (
            <div className="space-y-6">
              {/* Loading Skeleton */}
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-3" />
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
              <div>
                <Skeleton className="h-4 w-28 mb-3" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Full Description */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                  <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100">Full Description</h4>
                </div>
                <div className="bg-white dark:bg-stone-800 rounded-lg p-4 border border-stone-200 dark:border-stone-700">
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{task.description}</p>
                </div>
              </div>

              {/* Task Steps */}
              {task.steps && task.steps.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                    <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100">Task Steps</h4>
                  </div>
                  <div className="space-y-3">
                    {task.steps
                      .sort((a, b) => a.order - b.order)
                      .map((step) => (
                        <div
                          key={step.id}
                          className="bg-white dark:bg-stone-800 rounded-lg p-4 border border-stone-200 dark:border-stone-700 flex items-start space-x-3"
                        >
                          {getStepIcon(step.status)}
                          <div className="flex-1">
                            <h5 className={`font-medium ${getStepStatusColor(step.status)}`}>{step.title}</h5>
                            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{step.description}</p>
                            {step.estimatedTime && (
                              <span className="text-xs text-stone-500 dark:text-stone-400 mt-2 inline-block">
                                Est. {step.estimatedTime}
                              </span>
                            )}
                          </div>
                          {step.completedAt && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400">
                              ✓ {new Date(step.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Agent Information */}
              {task.agentLabel && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                    <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100">Assigned Agent</h4>
                  </div>
                  <div
                    className={`bg-${statusColor}-50 dark:bg-${statusColor}-900/20 border border-${statusColor}-200 dark:border-${statusColor}-800 rounded-lg p-4`}
                  >
                    <p className={`text-${statusColor}-800 dark:text-${statusColor}-300 font-medium`}>
                      {task.agentLabel}
                    </p>
                    {task.agentDescription && (
                      <p className={`text-${statusColor}-700 dark:text-${statusColor}-400 text-sm mt-1`}>
                        {task.agentDescription}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {task.attachments && task.attachments.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Paperclip className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                    <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100">Attachments</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 flex items-center space-x-2"
                      >
                        <Paperclip className="w-3 h-3 text-stone-500 dark:text-stone-400" />
                        <span className="text-sm text-stone-700 dark:text-stone-300">{attachment.name}</span>
                        {attachment.type === "voice" && attachment.duration && (
                          <span className="text-xs text-stone-500 dark:text-stone-400">({attachment.duration}s)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Information */}
              {task.is_error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-300 text-sm">
                    <strong>Error:</strong> {task.errorMessage || "An error occurred while processing this task."}
                  </p>
                </div>
              )}

              {/* Scheduling Information */}
              {task.scheduledFor && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <p className="text-purple-800 dark:text-purple-300 text-sm">
                    <strong>Scheduled for:</strong> {new Date(task.scheduledFor).toLocaleDateString()} at{" "}
                    {new Date(task.scheduledFor).toLocaleTimeString()}
                  </p>
                  {task.isRecurring && (
                    <p className="text-purple-700 dark:text-purple-400 text-xs mt-1">
                      Recurring: {task.recurringPattern}
                    </p>
                  )}
                </div>
              )}

              {/* Completion Information */}
              {task.status === "completed" && task.completedAt && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                  <p className="text-emerald-800 dark:text-emerald-300 text-sm">
                    ✅ <strong>Completed on:</strong> {new Date(task.completedAt).toLocaleDateString()} at{" "}
                    {new Date(task.completedAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
