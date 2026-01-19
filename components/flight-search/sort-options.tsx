"use client"

import { DollarSign, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export type SortOption = "best" | "price" | "duration"

interface SortOptionsProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

const SORT_TABS = [
  { id: "best" as const, label: "Best", icon: Sparkles, description: "Quality & price" },
  { id: "price" as const, label: "Cheapest", icon: DollarSign, description: "Lowest price" },
  { id: "duration" as const, label: "Fastest", icon: Clock, description: "Shortest time" },
]

export function SortOptions({ value, onChange }: SortOptionsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
      {SORT_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
            value === tab.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <tab.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
