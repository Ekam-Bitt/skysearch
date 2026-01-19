"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { Check, MapPin, Plane, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Airport } from "@/lib/types"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface AirportSearchProps {
  value: Airport | null
  onChange: (airport: Airport | null) => void
  placeholder: string
  label: string
  icon?: "departure" | "arrival"
  excludeCode?: string
}

export function AirportSearch({
  value,
  onChange,
  placeholder,
  label,
  icon = "departure",
  excludeCode,
}: AirportSearchProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [airports, setAirports] = useState<Airport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const filteredAirports = airports; // Declare filteredAirports variable

  // Fetch airports from API
  useEffect(() => {
    if (!search || search.length < 1) {
      setAirports([])
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/airports/search?keyword=${encodeURIComponent(search)}`)
        if (response.ok) {
          const { data } = await response.json()
          const filtered = data.filter((airport: Airport) => {
            if (excludeCode && airport.iataCode === excludeCode) return false
            return true
          })
          setAirports(filtered.slice(0, 8))
        }
      } catch (error) {
        console.error("Airport search error:", error)
        setAirports([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search, excludeCode])

  const handleSelect = useCallback(
    (airport: Airport) => {
      onChange(airport)
      setOpen(false)
      setSearch("")
    },
    [onChange],
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange(null)
      setSearch("")
    },
    [onChange],
  )

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={label}
          className={cn(
            "h-auto w-full justify-start gap-3 rounded-xl border-border bg-card px-4 py-3 text-left font-normal hover:bg-secondary/50",
            !value && "text-muted-foreground",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon === "departure" ? <Plane className="h-5 w-5 rotate-45" /> : <MapPin className="h-5 w-5" />}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            {value ? (
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-foreground">{value.cityName}</span>
                <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {value.iataCode}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          {value && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClear(e as any)
                }
              }}
              className="shrink-0 rounded-full p-1 hover:bg-secondary cursor-pointer"
            >
              <X className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Clear selection</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            id={`airport-search-${label.toLowerCase().replace(/\s+/g, '-')}`}
            name={`airport-search-${label.toLowerCase().replace(/\s+/g, '-')}`}
            placeholder={`Search ${label.toLowerCase()}...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : airports.length === 0 ? (
              <CommandEmpty>{search ? "No airports found." : "Type to search airports..."}</CommandEmpty>
            ) : (
              <CommandGroup>
                {airports.map((airport) => (
                  <CommandItem
                    key={airport.iataCode}
                    value={airport.iataCode}
                    onSelect={() => handleSelect(airport)}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary text-xs font-bold text-secondary-foreground">
                      {airport.iataCode}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{airport.cityName}</span>
                      <span className="truncate text-xs text-muted-foreground">{airport.name}</span>
                    </div>
                    {value?.iataCode === airport.iataCode && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
