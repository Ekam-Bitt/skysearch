"use client"

import { useState } from "react"
import { Calendar, MapPin, Users, TrendingDown, TrendingUp, Sparkles, Share2, Check } from "lucide-react"
import type { SearchParams, FlightOffer } from "@/lib/types"
import { format } from "date-fns"
import { useMemo } from "react"
import { formatPrice } from "@/lib/flight-utils"
import { Button } from "@/components/ui/button"

interface ResultsHeaderProps {
  searchParams: SearchParams
  resultCount: number
  filteredCount: number
  flights?: FlightOffer[]
}

type PriceInsight = {
  type: "low" | "typical" | "high"
  message: string
  icon: typeof TrendingDown
  color: string
}

function getPriceInsight(flights: FlightOffer[]): PriceInsight | null {
  if (flights.length === 0) return null

  const prices = flights.map(f => parseFloat(f.price.grandTotal))
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
  const lowestPrice = Math.min(...prices)
  const highestPrice = Math.max(...prices)
  const priceRange = highestPrice - lowestPrice

  // Calculate price spread to determine insight
  const spreadPercentage = priceRange / avgPrice

  // If there's a good variety of prices and lowest is significantly below avg
  if (lowestPrice < avgPrice * 0.85) {
    return {
      type: "low",
      message: `Great prices! From ${formatPrice(lowestPrice.toString())}`,
      icon: TrendingDown,
      color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50",
    }
  }

  // If prices are clustered high
  if (lowestPrice > avgPrice * 0.95 && spreadPercentage < 0.15) {
    return {
      type: "high",
      message: "Prices are higher than usual",
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50",
    }
  }

  // Typical pricing
  return {
    type: "typical",
    message: "Typical prices for this route",
    icon: Sparkles,
    color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50",
  }
}

export function ResultsHeader({ searchParams, resultCount, filteredCount, flights = [] }: ResultsHeaderProps) {
  const [copied, setCopied] = useState(false)
  const totalPassengers =
    searchParams.passengers.adults + searchParams.passengers.children + searchParams.passengers.infants

  const priceInsight = useMemo(() => getPriceInsight(flights), [flights])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold md:text-2xl">
              {searchParams.origin?.cityName} to {searchParams.destination?.cityName}
            </h2>
            {/* Price Insights Badge */}
            {priceInsight && (
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${priceInsight.color}`}
              >
                <priceInsight.icon className="h-3.5 w-3.5" />
                <span>{priceInsight.message}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {searchParams.origin?.iataCode} → {searchParams.destination?.iataCode}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {searchParams.departureDate && format(searchParams.departureDate, "MMM d")}
              {searchParams.tripType === "round-trip" &&
                searchParams.returnDate &&
                ` - ${format(searchParams.returnDate, "MMM d")}`}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {totalPassengers} traveler{totalPassengers > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Share Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </>
            )}
          </Button>
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredCount}</span> of{" "}
            <span className="font-semibold text-foreground">{resultCount}</span> flights
          </div>
        </div>
      </div>
    </div>
  )
}

