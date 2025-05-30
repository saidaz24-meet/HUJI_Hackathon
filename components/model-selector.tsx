// components/model-selector.tsx
import { Button } from "./ui/button"
import { Sparkles, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModelSelectorProps {
    selectedModel: "shaman-light" | "shaman-pro"
    onChange: (model: "shaman-light" | "shaman-pro") => void
    disabled?: boolean
}

export function ModelSelector({ selectedModel, onChange, disabled = false }: ModelSelectorProps) {
    return (
        <div className="flex border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                    "flex-1 rounded-none py-5 px-4 justify-start",
                    selectedModel === "shaman-light"
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r border-stone-200 dark:border-stone-700"
                        : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50"
                )}
                onClick={() => onChange("shaman-light")}
                disabled={disabled}
            >
                <Zap className={cn("mr-2 h-4 w-4", selectedModel === "shaman-light" ? "text-blue-500" : "text-stone-400")} />
                <div className="flex flex-col items-start">
                    <span className="font-medium">Shaman Light</span>
                    <span className="text-xs opacity-70">Faster, optimized for simple tasks</span>
                </div>
            </Button>

            <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                    "flex-1 rounded-none py-5 px-4 justify-start",
                    selectedModel === "shaman-pro"
                        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                        : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50"
                )}
                onClick={() => onChange("shaman-pro")}
                disabled={disabled}
            >
                <Sparkles className={cn("mr-2 h-4 w-4", selectedModel === "shaman-pro" ? "text-purple-500" : "text-stone-400")} />
                <div className="flex flex-col items-start">
                    <span className="font-medium">Shaman Pro</span>
                    <span className="text-xs opacity-70">Powerful, advanced capabilities</span>
                </div>
            </Button>
        </div>
    )
}