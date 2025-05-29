"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"
import { ArrowLeft, Moon, Sun, Bell, CheckCircle, FileText, AlertCircle, Clock, Trash2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Notification {
  id: string
  type: "success" | "warning" | "info" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionable?: boolean
  documentName?: string
}

export default function NotificationsPage() {
  const { darkMode, setDarkMode } = useTheme()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Document Signed Successfully",
      message: "Your rental agreement has been signed and saved to your documents.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      documentName: "Rental_Agreement_2024.pdf",
    },
    {
      id: "2",
      type: "info",
      title: "Form Auto-filled",
      message: "W-9 tax form has been automatically filled using your profile information.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      documentName: "W9_Form_2024.pdf",
    },
    {
      id: "3",
      type: "warning",
      title: "Signature Required",
      message: "Employment contract is ready for your signature. Please review and sign.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
      actionable: true,
      documentName: "Employment_Contract.pdf",
    },
    {
      id: "4",
      type: "success",
      title: "Profile Updated",
      message: "Your profile information has been successfully updated.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
    },
    {
      id: "5",
      type: "info",
      title: "New Feature Available",
      message: "Voice message support is now available in chat. Try recording your next request!",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
    },
    {
      id: "6",
      type: "error",
      title: "Document Processing Failed",
      message: "Unable to process insurance_claim.pdf. Please check the file format and try again.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      documentName: "insurance_claim.pdf",
    },
  ])

  const [filter, setFilter] = useState<"all" | "unread" | "actionable">("all")

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Bell className="w-5 h-5 text-blue-500" />
    }
  }

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    toast({
      title: "All notifications marked as read",
      description: "Your notification list has been updated.",
    })
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    })
  }

  const clearAllNotifications = () => {
    setNotifications([])
    toast({
      title: "All notifications cleared",
      description: "Your notification list is now empty.",
    })
  }

  const filteredNotifications = notifications.filter((notif) => {
    switch (filter) {
      case "unread":
        return !notif.read
      case "actionable":
        return notif.actionable
      default:
        return true
    }
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors duration-300 flex flex-col">
      <Toaster />

      {/* Header */}
      <header className="container mx-auto px-8 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-stone-800 dark:bg-stone-200 rounded-sm transition-colors duration-300"></div>
            <span className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Shaman</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-stone-100 dark:bg-stone-700 rounded-2xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-stone-700 dark:text-stone-300" />
                </div>
                <div>
                  <h1 className="text-3xl font-extralight text-stone-900 dark:text-stone-100 tracking-tight">
                    Notifications
                  </h1>
                  <p className="text-stone-600 dark:text-stone-300 font-light">
                    Stay updated on your document processing and account activity
                  </p>
                </div>
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark All Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
                className={`rounded-lg text-sm font-medium transition-all duration-300 ${
                  filter === "all"
                    ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("unread")}
                className={`rounded-lg text-sm font-medium transition-all duration-300 ${
                  filter === "unread"
                    ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === "actionable" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("actionable")}
                className={`rounded-lg text-sm font-medium transition-all duration-300 ${
                  filter === "actionable"
                    ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                Action Required ({notifications.filter((n) => n.actionable).length})
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-stone-400 dark:text-stone-500" />
                </div>
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                  {filter === "all" ? "No notifications" : `No ${filter} notifications`}
                </h3>
                <p className="text-stone-600 dark:text-stone-400">
                  {filter === "all"
                    ? "You're all caught up! New notifications will appear here."
                    : `You don't have any ${filter} notifications at the moment.`}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white dark:bg-stone-800 rounded-2xl border transition-all duration-300 hover:shadow-md ${
                    notification.read
                      ? "border-stone-200 dark:border-stone-700"
                      : "border-stone-300 dark:border-stone-600 shadow-sm"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3
                              className={`text-base font-medium ${
                                notification.read
                                  ? "text-stone-700 dark:text-stone-300"
                                  : "text-stone-900 dark:text-stone-100"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            {notification.actionable && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                                Action Required
                              </span>
                            )}
                          </div>

                          <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-2">
                            {notification.message}
                          </p>

                          {notification.documentName && (
                            <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400 mb-3">
                              <FileText className="w-3 h-3" />
                              <span>{notification.documentName}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-xs text-stone-500 dark:text-stone-400">
                              <Clock className="w-3 h-3" />
                              <span>{getTimeAgo(notification.timestamp)}</span>
                            </div>

                            {notification.actionable && (
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  className="h-7 px-3 bg-stone-800 dark:bg-stone-200 hover:bg-stone-900 dark:hover:bg-stone-100 text-white dark:text-stone-900 text-xs"
                                >
                                  Review Document
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-8 w-8 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
