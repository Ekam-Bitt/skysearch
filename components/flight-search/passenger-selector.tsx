"use client"

import { useState } from "react"
import { Minus, Plus, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface PassengerSelectorProps {
  value: {
    adults: number
    children: number
    infants: number
  }
  onChange: (value: { adults: number; children: number; infants: number }) => void
}

export function PassengerSelector({ value, onChange }: PassengerSelectorProps) {
  const [open, setOpen] = useState(false)
  const totalPassengers = value.adults + value.children + value.infants

  const updateCount = (type: "adults" | "children" | "infants", delta: number) => {
    const newValue = { ...value }
    newValue[type] = Math.max(type === "adults" ? 1 : 0, Math.min(9, newValue[type] + delta))

    // Infants can't exceed adults
    if (type === "adults" && newValue.infants > newValue.adults) {
      newValue.infants = newValue.adults
    }

    onChange(newValue)
  }

  const getPassengerLabel = () => {
    const parts = []
    if (value.adults > 0) {
      parts.push(`${value.adults} Adult${value.adults > 1 ? "s" : ""}`)
    }
    if (value.children > 0) {
      parts.push(`${value.children} Child${value.children > 1 ? "ren" : ""}`)
    }
    if (value.infants > 0) {
      parts.push(`${value.infants} Infant${value.infants > 1 ? "s" : ""}`)
    }
    return parts.join(", ")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto w-full justify-start gap-3 rounded-xl border-border bg-card px-4 py-3 text-left font-normal hover:bg-secondary/50",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs font-medium text-muted-foreground">Travelers</span>
            <span className="truncate font-semibold text-foreground">
              {totalPassengers} Traveler{totalPassengers > 1 ? "s" : ""}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          <PassengerRow
            label="Adults"
            description="12+ years"
            value={value.adults}
            min={1}
            max={9}
            onDecrease={() => updateCount("adults", -1)}
            onIncrease={() => updateCount("adults", 1)}
          />
          <PassengerRow
            label="Children"
            description="2-11 years"
            value={value.children}
            min={0}
            max={9}
            onDecrease={() => updateCount("children", -1)}
            onIncrease={() => updateCount("children", 1)}
          />
          <PassengerRow
            label="Infants"
            description="Under 2 years"
            value={value.infants}
            min={0}
            max={value.adults}
            onDecrease={() => updateCount("infants", -1)}
            onIncrease={() => updateCount("infants", 1)}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function PassengerRow({
  label,
  description,
  value,
  min,
  max,
  onDecrease,
  onIncrease,
}: {
  label: string
  description: string
  value: number
  min: number
  max: number
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-transparent"
          onClick={onDecrease}
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
          <span className="sr-only">Decrease {label}</span>
        </Button>
        <span className="w-4 text-center font-semibold">{value}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-transparent"
          onClick={onIncrease}
          disabled={value >= max}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Increase {label}</span>
        </Button>
      </div>
    </div>
  )
}
