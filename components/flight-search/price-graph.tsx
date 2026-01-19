"use client"

import { useMemo, useState, useCallback, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"
import { ChevronLeft, ChevronRight, Minus, Plus, BarChart3, Grid3X3, AlertCircle } from "lucide-react"
import type { SearchParams, FilterState, FlightOffer } from "@/lib/types"
import { formatPrice, toLocalDateString } from "@/lib/flight-utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DateGrid } from "./date-grid"

interface PriceGraphProps {
  searchParams: SearchParams | null
  filters: FilterState
  flights: FlightOffer[]
  filteredFlights: FlightOffer[]
  onDateSelect: (date: Date, returnDate?: Date) => void
}

type ViewMode = "dates" | "graph"

const BARS_PER_VIEW = 14

export function PriceGraph({ searchParams, filters, flights, filteredFlights, onDateSelect }: PriceGraphProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("graph")
  const [viewOffset, setViewOffset] = useState(0)
  const [priceData, setPriceData] = useState<any[]>([])
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 11 })
  const [priceError, setPriceError] = useState<string | null>(null)

  const calculatedTripDuration = useMemo(() => {
    if (searchParams?.tripType === "round-trip" && searchParams.departureDate && searchParams.returnDate) {
      const diffTime = searchParams.returnDate.getTime() - searchParams.departureDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(1, diffDays)
    }
    return 7 // default fallback
  }, [searchParams?.tripType, searchParams?.departureDate, searchParams?.returnDate])

  const [tripDuration, setTripDuration] = useState(calculatedTripDuration)

  useEffect(() => {
    setTripDuration(calculatedTripDuration)
  }, [calculatedTripDuration])

  const isRoundTrip = searchParams?.tripType === "round-trip"

  // Fetch price calendar data from API
  useEffect(() => {
    if (!searchParams?.origin || !searchParams?.destination || !searchParams?.departureDate) {
      setPriceData([])
      return
    }

    setIsLoadingPrices(true)
    setPriceError(null)
    setFetchProgress({ current: 0, total: 11 })
    setPriceData([]) // Clear old data while loading

    const fetchPriceData = async () => {
      try {
        const today = new Date()
        const selectedDate = new Date(searchParams!.departureDate!)

        // Start 5 days before selected date, but not before today
        const startDate = new Date(selectedDate)
        startDate.setDate(startDate.getDate() - 5)

        // Reset time components for accurate date comparison
        today.setHours(0, 0, 0, 0)
        startDate.setHours(0, 0, 0, 0)

        if (startDate < today) {
          startDate.setTime(today.getTime())
        }

        const priceDataMap: Record<string, any> = {}
        let requestCount = 0
        const MAX_REQUESTS = 15 // Limit to prevent rate limiting
        const DAYS_TO_FETCH = 11 // -5 to +5 days around selected date
        let rateLimited = false

        for (let i = 0; i < DAYS_TO_FETCH; i++) {
          const currentDate = new Date(startDate)
          currentDate.setDate(currentDate.getDate() + i)
          // Format as YYYY-MM-DD in local timezone (not UTC)
          const year = currentDate.getFullYear()
          const month = String(currentDate.getMonth() + 1).padStart(2, '0')
          const day = String(currentDate.getDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}`
          const dayOfWeek = currentDate.getDay()
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

          // For round trips, calculate return date properly
          let returnDateStr: string | undefined
          if (searchParams!.tripType === "round-trip" && searchParams!.returnDate) {
            const returnDate = new Date(currentDate)
            returnDate.setDate(returnDate.getDate() + tripDuration)
            // Format return date in local timezone
            const retYear = returnDate.getFullYear()
            const retMonth = String(returnDate.getMonth() + 1).padStart(2, '0')
            const retDay = String(returnDate.getDate()).padStart(2, '0')
            returnDateStr = `${retYear}-${retMonth}-${retDay}`

            // Skip if calculated return date is before departure
            if (returnDate <= currentDate) {
              priceDataMap[dateStr] = {
                date: dateStr,
                displayDate: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                price: 0,
                lowestPrice: 0,
                available: false,
                isWeekend,
                isSelected: false,
              }
              setFetchProgress(prev => ({ ...prev, current: i + 1 }))
              await new Promise((resolve) => setTimeout(resolve, 50))
              continue
            }
          }

          // If rate limited or max requests reached, fill with unavailable and continue progress
          if (rateLimited || requestCount >= MAX_REQUESTS) {
            priceDataMap[dateStr] = {
              date: dateStr,
              displayDate: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              price: 0,
              lowestPrice: 0,
              available: false,
              isWeekend,
              isSelected: false,
            }
            setFetchProgress(prev => ({ ...prev, current: i + 1 }))
            await new Promise((resolve) => setTimeout(resolve, 50))
            continue
          }

          // Try to fetch real price data with rate limit handling
          try {
            const response = await fetch("/api/flights/search", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                originLocationCode: searchParams!.origin!.iataCode,
                destinationLocationCode: searchParams!.destination!.iataCode,
                departureDate: dateStr,
                returnDate: returnDateStr,
                adults: searchParams!.passengers.adults,
                children: searchParams!.passengers.children,
                infants: searchParams!.passengers.infants,
                travelClass: searchParams!.cabinClass,
                max: 20,
              }),
            })

            requestCount++
            setFetchProgress(prev => ({ ...prev, current: i + 1 }))

            if (response.status === 429) {
              console.log("[v0] Rate limited, filling remaining with unavailable data")
              rateLimited = true
              priceDataMap[dateStr] = {
                date: dateStr,
                displayDate: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                price: 0,
                lowestPrice: 0,
                available: false,
                isWeekend,
                isSelected: false,
              }
              continue
            }

            if (response.ok) {
              const { data } = await response.json()
              if (data && data.length > 0) {
                const lowestPrice = Math.min(...data.map((f: any) => parseFloat(f.price.grandTotal)))
                priceDataMap[dateStr] = {
                  date: dateStr,
                  displayDate: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                  price: lowestPrice,
                  lowestPrice,
                  available: true,
                  isWeekend,
                  isSelected: dateStr === toLocalDateString(searchParams!.departureDate!),
                }
              } else {
                priceDataMap[dateStr] = {
                  date: dateStr,
                  displayDate: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                  price: 0,
                  lowestPrice: 0,
                  available: false,
                  isWeekend,
                  isSelected: false,
                }
              }
            }
          } catch (error) {
            priceDataMap[dateStr] = {
              date: dateStr,
              displayDate: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              price: 0,
              lowestPrice: 0,
              available: false,
              isWeekend,
              isSelected: false,
            }
          }

          if (i % 3 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 300))
          }
        }

        const unsortedData = Object.values(priceDataMap)
        const sortedData = unsortedData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setPriceData(sortedData)

        // Center on selected date
        if (searchParams?.departureDate) {
          const selectedDateStr = toLocalDateString(searchParams.departureDate)
          const selectedIndex = sortedData.findIndex((d: any) => d.date === selectedDateStr)

          if (selectedIndex >= 0) {
            const centerOffset = Math.max(0, selectedIndex - Math.floor(BARS_PER_VIEW / 2))
            const maxOffset = Math.max(0, sortedData.length - BARS_PER_VIEW)
            setViewOffset(Math.min(centerOffset, maxOffset))
          }
        }

      } catch (error) {
        console.error("Error fetching price data:", error)
        setPriceError("Failed to load price data")
      } finally {
        setIsLoadingPrices(false)
      }
    }

    fetchPriceData()
  }, [searchParams, tripDuration, calculatedTripDuration])

  // Get visible data for current view - adjust based on filtered flights
  const visibleData = useMemo(() => {
    const baseData = priceData.slice(viewOffset, viewOffset + BARS_PER_VIEW)

    // If no filters are applied (filteredFlights equals flights), show original data
    if (filteredFlights.length === flights.length || flights.length === 0) {
      return baseData
    }

    // Apply filter effects: for each date, check if any filtered flights exist for that date
    // and use the filtered lowest price
    return baseData.map(item => {
      const itemDate = item.date

      // Find filtered flights for this departure date
      const matchingFlights = filteredFlights.filter(flight => {
        const flightDepDate = flight.itineraries[0].segments[0].departure.at.split("T")[0]
        return flightDepDate === itemDate
      })

      if (matchingFlights.length === 0) {
        // No filtered flights for this date - mark as unavailable for current filters
        return {
          ...item,
          filteredOut: true,
          originalPrice: item.price,
        }
      }

      // Calculate lowest price from filtered flights
      const lowestFilteredPrice = Math.min(
        ...matchingFlights.map(f => parseFloat(f.price.grandTotal))
      )

      return {
        ...item,
        price: lowestFilteredPrice,
        filteredOut: false,
        originalPrice: item.price,
      }
    })
  }, [priceData, viewOffset, flights, filteredFlights])

  // Calculate statistics from filtered visible data
  const stats = useMemo(() => {
    const availablePrices = visibleData.filter((d) => d.available && !d.filteredOut).map((d) => d.price)
    if (availablePrices.length === 0) return null

    return {
      min: Math.min(...availablePrices),
      max: Math.max(...availablePrices),
      avg: Math.round(availablePrices.reduce((a, b) => a + b, 0) / availablePrices.length),
    }
  }, [visibleData])

  // Find the lowest price date info
  const lowestPriceInfo = useMemo(() => {
    const available = visibleData.filter((d) => d.available && !d.filteredOut)
    if (available.length === 0) return null
    const lowest = available.reduce((min, d) => (d.price < min.price ? d : min), available[0])
    return lowest
  }, [visibleData])

  const handleBarClick = useCallback(
    (data: any) => {
      if (data.available) {
        onDateSelect(new Date(data.date))
      }
    },
    [onDateSelect],
  )

  const handleGridDateSelect = useCallback(
    (departureDate: Date, returnDate: Date) => {
      onDateSelect(departureDate, returnDate)
    },
    [onDateSelect],
  )

  const canGoBack = viewOffset > 0
  const canGoForward = viewOffset + BARS_PER_VIEW < priceData.length

  const handlePrevious = () => {
    setViewOffset(Math.max(0, viewOffset - 7))
  }

  const handleNext = () => {
    setViewOffset(Math.min(priceData.length - BARS_PER_VIEW, viewOffset + 7))
  }

  const adjustTripDuration = (delta: number) => {
    setTripDuration((prev) => Math.max(1, Math.min(30, prev + delta)))
  }

  // Get selected date info for display
  const selectedDateInfo = useMemo(() => {
    if (!searchParams?.departureDate) return null
    const dateStr = toLocalDateString(searchParams.departureDate)
    const found = priceData.find((d) => d.date === dateStr)
    if (!found) return null

    const depDate = new Date(searchParams.departureDate)
    const returnDate = isRoundTrip ? new Date(depDate.getTime() + tripDuration * 24 * 60 * 60 * 1000) : null

    return {
      ...found,
      depFormatted: depDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      returnFormatted: returnDate
        ? returnDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
        : null,
    }
  }, [searchParams?.departureDate, priceData, isRoundTrip, tripDuration])

  if (!searchParams?.origin || !searchParams?.destination) {
    return null
  }

  const chartPrimary = "#3b82f6"
  const chartSelected = "#1d4ed8"
  const chartUnavailable = "#e2e8f0"

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 border-b border-border">
            <button
              onClick={() => setViewMode("dates")}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                viewMode === "dates"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Grid3X3 className="h-4 w-4" />
              Dates
            </button>
            <button
              onClick={() => setViewMode("graph")}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                viewMode === "graph"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Price graph
            </button>
          </div>

          {/* View-specific header content */}
          {viewMode === "graph" && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Left side: Trip Duration */}
              <div className="space-y-3">
                {/* Trip Duration Control (only for round trip) */}
                {isRoundTrip && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
                      <span className="text-sm font-medium">{tripDuration}-day trip</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => adjustTripDuration(-1)}
                          disabled={tripDuration <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => adjustTripDuration(1)}
                          disabled={tripDuration >= 30}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Date Info */}
                {selectedDateInfo && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {selectedDateInfo.depFormatted}
                      {selectedDateInfo.returnFormatted && <span> - {selectedDateInfo.returnFormatted}</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      From <span className="font-semibold text-primary">{formatPrice(selectedDateInfo.price)}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Right side: Stats */}
              {stats && (
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Lowest</p>
                    <p className="font-bold text-primary">{formatPrice(stats.min)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Average</p>
                    <p className="font-bold">{formatPrice(stats.avg)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Highest</p>
                    <p className="font-bold">{formatPrice(stats.max)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {isLoadingPrices ? (
          <div className="flex h-56 flex-col items-center justify-center gap-4 md:h-64">
            <div className="w-full max-w-xs space-y-3">
              {/* Progress bar container */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="absolute inset-y-0 left-0 bg-primary transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${(fetchProgress.current / fetchProgress.total) * 100}%` }}
                />
              </div>
              {/* Progress text */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fetching flight prices...</span>
                <span className="font-medium text-primary">
                  {fetchProgress.current}/{fetchProgress.total}
                </span>
              </div>
              {/* Loading dots animation */}
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-primary animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : priceError ? (
          <div className="flex h-56 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 md:h-64">
            <div className="text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
              <p className="mt-2 text-sm text-destructive">{priceError}</p>
            </div>
          </div>
        ) : viewMode === "dates" && isRoundTrip ? (
          <DateGrid searchParams={searchParams} flights={flights} filteredFlights={filteredFlights} onDateSelect={handleGridDateSelect} />
        ) : viewMode === "dates" && !isRoundTrip ? (
          // For one-way, show a simplified date list or fallback to graph
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
            <p>Date grid is available for round-trip flights.</p>
            <p className="mt-1">Switch to the Price graph to explore dates for one-way flights.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute -left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-card shadow-md",
                !canGoBack && "invisible",
              )}
              onClick={handlePrevious}
              disabled={!canGoBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute -right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-card shadow-md",
                !canGoForward && "invisible",
              )}
              onClick={handleNext}
              disabled={!canGoForward}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Chart */}
            <div className="h-56 w-full md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visibleData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap="15%">
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    width={50}
                  />
                  {stats && <ReferenceLine y={stats.avg} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1} />}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        const fullDate = new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })

                        if (isRoundTrip) {
                          const departureDate = new Date(data.date + "T00:00:00")
                          const returnDate = new Date(departureDate.getTime() + tripDuration * 24 * 60 * 60 * 1000)
                          const depFormatted = departureDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                          const returnFormatted = returnDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                          return (
                            <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                              <p className="text-xs text-muted-foreground">{tripDuration}-day trip</p>
                              <p className="text-sm font-medium">
                                {depFormatted} - {returnFormatted}
                              </p>
                              {data.available ? (
                                <p className="text-base font-bold text-primary">{formatPrice(data.price)}</p>
                              ) : (
                                <p className="text-sm text-muted-foreground">Not available</p>
                              )}
                              {data.isWeekend && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  Weekend
                                </Badge>
                              )}
                            </div>
                          )
                        }

                        return (
                          <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                            <p className="text-sm font-medium">{fullDate}</p>
                            {data.available ? (
                              <p className="text-base font-bold text-primary">{formatPrice(data.price)}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground">Not available</p>
                            )}
                            {data.isWeekend && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                Weekend
                              </Badge>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar
                    dataKey="price"
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => handleBarClick(data)}
                    className="cursor-pointer"
                  >
                    {visibleData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          !entry.available
                            ? chartUnavailable
                            : entry.filteredOut
                              ? "#94a3b8" // Gray for filtered out
                              : entry.isSelected
                                ? chartSelected
                                : entry.price === lowestPriceInfo?.price
                                  ? "#22c55e"
                                  : chartPrimary
                        }
                        opacity={entry.filteredOut ? 0.4 : 1}
                        className="transition-opacity hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-[#22c55e]" />
                <span>Lowest price</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-[#3b82f6]" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-[#1d4ed8]" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-[#e2e8f0]" />
                <span>Unavailable</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
