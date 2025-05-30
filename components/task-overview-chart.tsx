"use client"

import * as React from "react"
import { AlertCircle, Play, Calendar, CheckCircle2 } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface TaskStats {
  pending: number
  inProgress: number
  scheduled: number
  completed: number
}

interface TaskOverviewChartProps {
  taskStats: TaskStats
  onSegmentClick?: (status: string) => void
}

const COLORS = {
  pending: "#f59e0b",
  inProgress: "#3b82f6",
  scheduled: "#8b5cf6",
  completed: "#10b981",
}

const STATUS_LABELS = {
  pending: "Pending",
  inProgress: "In Progress",
  scheduled: "Scheduled",
  completed: "Completed",
}

const STATUS_ICONS = {
  pending: AlertCircle,
  inProgress: Play,
  scheduled: Calendar,
  completed: CheckCircle2,
}

export function TaskOverviewChart({ taskStats, onSegmentClick }: TaskOverviewChartProps) {
  const chartData = [
    {
      name: "pending",
      value: taskStats.pending,
      color: COLORS.pending,
      label: STATUS_LABELS.pending,
    },
    {
      name: "inProgress",
      value: taskStats.inProgress,
      color: COLORS.inProgress,
      label: STATUS_LABELS.inProgress,
    },
    {
      name: "scheduled",
      value: taskStats.scheduled,
      color: COLORS.scheduled,
      label: STATUS_LABELS.scheduled,
    },
    {
      name: "completed",
      value: taskStats.completed,
      color: COLORS.completed,
      label: STATUS_LABELS.completed,
    },
  ].filter((item) => item.value > 0)

  const totalTasks = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [chartData])

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "inProgress":
        return "in-progress"
      default:
        return status
    }
  }

  const handlePieClick = (data: any) => {
    if (onSegmentClick && data) {
      onSegmentClick(getStatusLabel(data.name))
    }
  }

  // Improve the CustomTooltip component to have better visibility in dark mode
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-stone-900 dark:text-stone-100">
            {data.payload.label}: {data.value}
          </p>
        </div>
      )
    }
    return null
  }

  // Update the empty state to have better visibility in dark mode
  if (totalTasks === 0) {
    return (
      <Card className="flex flex-col bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
        <CardHeader className="items-center pb-0">
          <CardTitle>Task Overview</CardTitle>
          <CardDescription>Your current task distribution</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex aspect-square max-h-[250px] items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400">No tasks yet</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="leading-none text-stone-500 dark:text-stone-400">
            Create your first task to see your overview
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
      <CardHeader className="items-center pb-0">
        <CardTitle>Task Overview</CardTitle>
        <CardDescription>Your current task distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="mx-auto aspect-square max-h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                onClick={handlePieClick}
                className="cursor-pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={2}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-white dark:bg-stone-800 rounded-full p-4 shadow-sm border border-stone-100 dark:border-stone-700">
              <div className="text-3xl font-bold text-stone-900 dark:text-stone-100">{totalTasks}</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Tasks</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="grid grid-cols-2 gap-2 w-full">
          {chartData.map((item) => {
            const IconComponent = STATUS_ICONS[item.name as keyof typeof STATUS_ICONS]
            return (
              <button
                key={item.name}
                onClick={() => onSegmentClick?.(getStatusLabel(item.name))}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-left"
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <IconComponent className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <div className="flex-1">
                  <div className="font-medium text-stone-900 dark:text-stone-100">{item.value}</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">{item.label}</div>
                </div>
              </button>
            )
          })}
        </div>
        <div className="leading-none text-stone-500 dark:text-stone-400 text-center">
          Click on chart or items to filter tasks
        </div>
      </CardFooter>
    </Card>
  )
}
