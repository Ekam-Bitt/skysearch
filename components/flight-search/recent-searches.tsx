"use client"

import { Clock, Plane, ArrowRight, X } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useRecentSearches, clearRecentSearches, type RecentSearch } from "@/lib/recent-searches"
import { parseLocalDate } from "@/lib/flight-utils"
import { Button } from "@/components/ui/button"

interface RecentSearchesProps {
    onSelectSearch: (search: RecentSearch) => void
}

export function RecentSearches({ onSelectSearch }: RecentSearchesProps) {
    const { searches, refresh } = useRecentSearches()

    if (searches.length === 0) return null

    const handleClear = () => {
        clearRecentSearches()
        refresh()
    }

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Recent searches
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-xs text-muted-foreground hover:text-foreground h-auto py-1"
                >
                    Clear all
                </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {searches.map((search) => {
                    const departureDate = parseLocalDate(search.departureDate)
                    const returnDate = search.returnDate ? parseLocalDate(search.returnDate) : null

                    return (
                        <button
                            key={search.id}
                            onClick={() => onSelectSearch(search)}
                            className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md"
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Plane className="h-4 w-4" />
                                </div>
                                <div className="flex items-center gap-2 font-medium">
                                    <span>{search.origin.cityName}</span>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    <span>{search.destination.cityName}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="rounded bg-secondary px-1.5 py-0.5">
                                    {search.origin.iataCode} → {search.destination.iataCode}
                                </span>
                                <span>
                                    {format(departureDate, "MMM d")}
                                    {returnDate && ` - ${format(returnDate, "MMM d")}`}
                                </span>
                                <span className="capitalize">{search.tripType}</span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
