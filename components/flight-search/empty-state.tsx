"use client"

import { Plane, SearchX, Filter, Calendar, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  type: "no-search" | "no-results" | "no-filtered"
  onClearFilters?: () => void
}

export function EmptyState({ type, onClearFilters }: EmptyStateProps) {
  if (type === "no-search") {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 px-6 text-center">
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
            <Plane className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
        <h3 className="text-2xl font-bold tracking-tight">Start your journey</h3>
        <p className="mt-3 max-w-md text-muted-foreground leading-relaxed">
          Enter your departure city, destination, and travel dates above to discover available flights and find the best deals.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-3 py-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>100+ destinations</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-3 py-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Flexible dates</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-3 py-1.5">
            <Plane className="h-3.5 w-3.5" />
            <span>Real-time prices</span>
          </div>
        </div>
      </div>
    )
  }

  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 px-6 text-center">
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-destructive/20 to-destructive/5">
            <SearchX className="h-10 w-10 text-destructive" />
          </div>
        </div>
        <h3 className="text-2xl font-bold tracking-tight">No flights available</h3>
        <p className="mt-3 max-w-md text-muted-foreground leading-relaxed">
          We couldn&apos;t find any flights matching your search criteria. This route may not have direct flights for your selected dates.
        </p>
        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Try these suggestions:</p>
          <ul className="space-y-1.5">
            <li className="flex items-center justify-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" />
              Check nearby airports
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" />
              Try flexible dates (+/- 3 days)
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" />
              Consider connecting flights
            </li>
          </ul>
        </div>
      </div>
    )
  }

  // no-filtered
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 px-6 text-center">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-warning/20 to-warning/5">
          <Filter className="h-10 w-10 text-warning" />
        </div>
      </div>
      <h3 className="text-2xl font-bold tracking-tight">No matching flights</h3>
      <p className="mt-3 max-w-md text-muted-foreground leading-relaxed">
        Your current filters are too restrictive. No flights match all of your selected criteria.
      </p>
      <div className="mt-6 space-y-3">
        <p className="text-sm text-muted-foreground">
          Try adjusting your stops, price range, or airline preferences.
        </p>
        {onClearFilters && (
          <Button onClick={onClearFilters} variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Clear all filters
          </Button>
        )}
      </div>
    </div>
  )
}
