"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertCircle, ArrowLeft, Search, Filter, Play, CheckCircle2, Calendar } from "lucide-react"
import Link from "next/link"
import { useAuth } from "../../contexts/auth-context"
import { DatabaseService } from "@/lib/firebase/database"
import { TaskListSkeleton } from "@/components/task-skeleton"
import { ExpandableTaskCard } from "@/components/expandable-task-card"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/types/database"
import { useParams } from "next/navigation"

const STATUS_CONFIG = {
    pending: {
        title: "Pending Tasks",
        icon: AlertCircle,
        color: "amber",
        borderColor: "border-l-amber-500",
    },
    "in-progress": {
        title: "In Progress Tasks",
        icon: Play,
        color: "blue",
        borderColor: "border-l-blue-500",
    },
    scheduled: {
        title: "Scheduled Tasks",
        icon: Calendar,
        color: "purple",
        borderColor: "border-l-purple-500",
    },
    completed: {
        title: "Completed Tasks",
        icon: CheckCircle2,
        color: "emerald",
        borderColor: "border-l-emerald-500",
    },
    all: {
        title: "All Tasks",
        icon: AlertCircle,
        color: "stone",
        borderColor: "border-l-stone-500",
    },
}

export default function StatusTasksPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const params = useParams()
    const status = params.status as string

    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority" | "scheduled">("newest")

    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.all

    useEffect(() => {
        if (!user) return

        const unsubscribe = DatabaseService.listenToUserTasks(user.uid, (userTasks) => {
            let filteredTasks = userTasks
            if (status !== "all") {
                filteredTasks = userTasks.filter((task) => task.status === status)
            }
            setTasks(filteredTasks)
            setIsLoading(false)
        })

        return unsubscribe
    }, [user, status])

    const filteredAndSortedTasks = tasks
        .filter(
            (task) =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                case "priority":
                    const priorityOrder = { high: 3, medium: 2, low: 1 }
                    return priorityOrder[b.priority] - priorityOrder[a.priority]
                case "scheduled":
                    if (!a.scheduledFor && !b.scheduledFor) return 0
                    if (!a.scheduledFor) return 1
                    if (!b.scheduledFor) return -1
                    return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
                default:
                    return 0
            }
        })

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

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
            {/* Header */}
            <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <div className="flex items-center space-x-3">
                                <config.icon className={`w-6 h-6 text-${config.color}-500`} />
                                <h1 className="text-2xl font-light text-stone-900 dark:text-stone-100">
                                    {config.title} ({tasks.length})
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
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
                                        Sort by {sortBy}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy("priority")}>Priority</DropdownMenuItem>
                                    {status === "scheduled" && (
                                        <DropdownMenuItem onClick={() => setSortBy("scheduled")}>Scheduled Date</DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-7xl mx-auto">
                    {isLoading ? (
                        <TaskListSkeleton count={5} />
                    ) : filteredAndSortedTasks.length === 0 ? (
                        <div className="text-center py-16">
                            <div
                                className={`w-16 h-16 bg-${config.color}-100 dark:bg-${config.color}-900/30 rounded-full flex items-center justify-center mx-auto mb-4`}
                            >
                                <config.icon className={`w-8 h-8 text-${config.color}-500`} />
                            </div>
                            <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                                {searchQuery ? "No matching tasks" : `No ${status === "all" ? "" : status} tasks`}
                            </h3>
                            <p className="text-stone-600 dark:text-stone-400">
                                {searchQuery ? "Try adjusting your search query." : "Tasks will appear here when available."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAndSortedTasks.map((task) => (
                                <ExpandableTaskCard
                                    key={task.id}
                                    task={task}
                                    onDelete={handleDeleteTask}
                                    borderColor={config.borderColor}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
