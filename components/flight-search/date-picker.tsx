"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  label: string
  placeholder?: string
  minDate?: Date
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Select date",
  minDate,
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-auto w-full justify-start gap-3 rounded-xl border-border bg-card px-4 py-3 text-left font-normal hover:bg-secondary/50",
            !value && "text-muted-foreground",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            {value ? (
              <span className="font-semibold text-foreground">{format(value, "EEE, MMM d")}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value || undefined}
          onSelect={(date) => onChange(date || null)}
          disabled={(date) => {
            if (minDate && date < minDate) return true
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return date < today
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
