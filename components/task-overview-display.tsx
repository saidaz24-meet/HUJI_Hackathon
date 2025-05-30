"use client"
import { AlertCircle, Play, Calendar, CheckCircle2 } from "lucide-react"

interface TaskStats {
  pending: number
  inProgress: number
  scheduled: number
  completed: number
}

interface TaskOverviewDisplayProps {
  taskStats: TaskStats
  onSegmentClick?: (status: string) => void
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: AlertCircle,
    color: "amber",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-800 dark:text-amber-200",
    iconColor: "text-amber-500",
  },
  inProgress: {
    label: "In Progress",
    icon: Play,
    color: "blue",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-800 dark:text-blue-200",
    iconColor: "text-blue-500",
  },
  scheduled: {
    label: "Scheduled",
    icon: Calendar,
    color: "purple",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    textColor: "text-purple-800 dark:text-purple-200",
    iconColor: "text-purple-500",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "emerald",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-800 dark:text-emerald-200",
    iconColor: "text-emerald-500",
  },
}

export function TaskOverviewDisplay({ taskStats, onSegmentClick }: TaskOverviewDisplayProps) {
  const totalTasks = taskStats.pending + taskStats.inProgress + taskStats.scheduled + taskStats.completed

  const getStatusKey = (status: string) => {
    switch (status) {
      case "in-progress":
        return "inProgress"
      default:
        return status
    }
  }

  const handleStatusClick = (status: string) => {
    const statusKey = status === "inProgress" ? "in-progress" : status
    onSegmentClick?.(statusKey)
  }

  if (totalTasks === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="relative">
          {/* Center Circle - Empty State */}
          <div className="w-52 h-52 mx-auto bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-800 rounded-full flex items-center justify-center shadow-lg border border-stone-200 dark:border-stone-600">
            <div className="text-center">
              <div className="text-6xl mb-3">📋</div>
              <div className="text-lg text-stone-500 dark:text-stone-400 font-medium">No Tasks</div>
            </div>
          </div>

          {/* Empty State Message */}
          <div className="text-center mt-10">
            <p className="text-lg text-stone-500 dark:text-stone-400">Create your first task to see your overview</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        {/* Status Blocks arranged around center */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Top Left - Pending */}
          <button
            onClick={() => handleStatusClick("pending")}
            className={`${STATUS_CONFIG.pending.bgColor} ${STATUS_CONFIG.pending.borderColor} border rounded-3xl p-8 hover:shadow-lg transition-all duration-300 hover:scale-105 text-left min-h-[140px]`}
          >
            <div className="flex items-center space-x-5">
              <STATUS_CONFIG.pending.icon className={`w-8 h-8 ${STATUS_CONFIG.pending.iconColor}`} />
              <div>
                <div className={`text-5xl font-bold ${STATUS_CONFIG.pending.textColor}`}>{taskStats.pending}</div>
                <div className={`text-base font-medium ${STATUS_CONFIG.pending.textColor} opacity-80 mt-1`}>
                  {STATUS_CONFIG.pending.label}
                </div>
              </div>
            </div>
          </button>

          {/* Top Right - In Progress */}
          <button
            onClick={() => handleStatusClick("inProgress")}
            className={`${STATUS_CONFIG.inProgress.bgColor} ${STATUS_CONFIG.inProgress.borderColor} border rounded-3xl p-8 hover:shadow-lg transition-all duration-300 hover:scale-105 text-left min-h-[140px]`}
          >
            <div className="flex items-center space-x-5">
              <STATUS_CONFIG.inProgress.icon className={`w-8 h-8 ${STATUS_CONFIG.inProgress.iconColor}`} />
              <div>
                <div className={`text-5xl font-bold ${STATUS_CONFIG.inProgress.textColor}`}>{taskStats.inProgress}</div>
                <div className={`text-base font-medium ${STATUS_CONFIG.inProgress.textColor} opacity-80 mt-1`}>
                  {STATUS_CONFIG.inProgress.label}
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Center Circle - Total Tasks */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-44 h-44 bg-gradient-to-br from-stone-800 to-stone-700 dark:from-stone-200 dark:to-stone-300 rounded-full flex items-center justify-center shadow-2xl border-6 border-white dark:border-stone-800">
            <div className="text-center">
              <div className="text-4xl font-bold text-white dark:text-stone-900">{totalTasks}</div>
              <div className="text-base text-white/80 dark:text-stone-900/80 font-medium mt-1">Tasks</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Bottom Left - Scheduled */}
          <button
            onClick={() => handleStatusClick("scheduled")}
            className={`${STATUS_CONFIG.scheduled.bgColor} ${STATUS_CONFIG.scheduled.borderColor} border rounded-3xl p-8 hover:shadow-lg transition-all duration-300 hover:scale-105 text-left min-h-[140px]`}
          >
            <div className="flex items-center space-x-5">
              <STATUS_CONFIG.scheduled.icon className={`w-8 h-8 ${STATUS_CONFIG.scheduled.iconColor}`} />
              <div>
                <div className={`text-5xl font-bold ${STATUS_CONFIG.scheduled.textColor}`}>{taskStats.scheduled}</div>
                <div className={`text-base font-medium ${STATUS_CONFIG.scheduled.textColor} opacity-80 mt-1`}>
                  {STATUS_CONFIG.scheduled.label}
                </div>
              </div>
            </div>
          </button>

          {/* Bottom Right - Completed */}
          <button
            onClick={() => handleStatusClick("completed")}
            className={`${STATUS_CONFIG.completed.bgColor} ${STATUS_CONFIG.completed.borderColor} border rounded-3xl p-8 hover:shadow-lg transition-all duration-300 hover:scale-105 text-left min-h-[140px]`}
          >
            <div className="flex items-center space-x-5">
              <STATUS_CONFIG.completed.icon className={`w-8 h-8 ${STATUS_CONFIG.completed.iconColor}`} />
              <div>
                <div className={`text-5xl font-bold ${STATUS_CONFIG.completed.textColor}`}>{taskStats.completed}</div>
                <div className={`text-base font-medium ${STATUS_CONFIG.completed.textColor} opacity-80 mt-1`}>
                  {STATUS_CONFIG.completed.label}
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Interaction Hint */}
        <div className="text-center mt-10">
          <p className="text-base text-stone-500 dark:text-stone-400">Click on any section to view those tasks</p>
        </div>
      </div>
    </div>
  )
}
