"use client"

import { useEffect, useState } from "react"
import type { SearchParams, Airport } from "@/lib/types"
import { toLocalDateString, parseLocalDate } from "@/lib/flight-utils"

const STORAGE_KEY = "skysearch_recent_searches"
const MAX_SEARCHES = 5

export interface RecentSearch {
    id: string
    origin: Airport
    destination: Airport
    departureDate: string
    returnDate?: string
    tripType: "one-way" | "round-trip"
    passengers: {
        adults: number
        children: number
        infants: number
    }
    timestamp: number
}

function generateSearchId(search: Omit<RecentSearch, "id" | "timestamp">): string {
    return `${search.origin.iataCode}-${search.destination.iataCode}-${search.departureDate}-${search.returnDate || ""}-${search.tripType}`
}

export function saveRecentSearch(params: SearchParams): void {
    if (typeof window === "undefined") return
    if (!params.origin || !params.destination || !params.departureDate) return

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        let searches: RecentSearch[] = stored ? JSON.parse(stored) : []

        const newSearch: RecentSearch = {
            id: generateSearchId({
                origin: params.origin,
                destination: params.destination,
                departureDate: toLocalDateString(params.departureDate),
                returnDate: params.returnDate ? toLocalDateString(params.returnDate) : undefined,
                tripType: params.tripType,
                passengers: params.passengers,
            }),
            origin: params.origin,
            destination: params.destination,
            departureDate: toLocalDateString(params.departureDate),
            returnDate: params.returnDate ? toLocalDateString(params.returnDate) : undefined,
            tripType: params.tripType,
            passengers: params.passengers,
            timestamp: Date.now(),
        }

        // Remove duplicate if exists
        searches = searches.filter(s => s.id !== newSearch.id)

        // Add to beginning
        searches.unshift(newSearch)

        // Keep only last 5
        searches = searches.slice(0, MAX_SEARCHES)

        localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
    } catch (error) {
        console.error("Failed to save recent search:", error)
    }
}

export function getRecentSearches(): RecentSearch[] {
    if (typeof window === "undefined") return []

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return []

        const searches: RecentSearch[] = JSON.parse(stored)

        // Filter out expired searches (older than 30 days) or past dates
        const now = Date.now()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return searches.filter(search => {
            const isRecent = now - search.timestamp < 30 * 24 * 60 * 60 * 1000
            const departureDate = parseLocalDate(search.departureDate)
            const isNotPast = departureDate >= today
            return isRecent && isNotPast
        })
    } catch (error) {
        console.error("Failed to get recent searches:", error)
        return []
    }
}

export function clearRecentSearches(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEY)
}

// Hook for React components
export function useRecentSearches() {
    const [searches, setSearches] = useState<RecentSearch[]>([])

    useEffect(() => {
        setSearches(getRecentSearches())
    }, [])

    const refresh = () => {
        setSearches(getRecentSearches())
    }

    return { searches, refresh }
}
