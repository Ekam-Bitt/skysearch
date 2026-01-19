"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plane } from "lucide-react"
import { type SearchParams, type FilterState, type FlightOffer, DEFAULT_FILTERS } from "@/lib/types"
import {
  getStopsCount,
  getDurationInMinutes,
  getHourFromDateTime,
  getPriceRange,
  getDurationRange,
  toLocalDateString,
} from "@/lib/flight-utils"
import { SearchForm } from "@/components/flight-search/search-form"
import { FlightCard } from "@/components/flight-search/flight-card"
import { FlightFilters } from "@/components/flight-search/flight-filters"
import { PriceGraph } from "@/components/flight-search/price-graph"
import { SortOptions, type SortOption } from "@/components/flight-search/sort-options"
import { ResultsHeader } from "@/components/flight-search/results-header"
import { LoadingSkeleton } from "@/components/flight-search/loading-skeleton"
import { EmptyState } from "@/components/flight-search/empty-state"
import { ThemeToggle } from "@/components/theme-toggle"
import { RecentSearches } from "@/components/flight-search/recent-searches"
import { saveRecentSearch, type RecentSearch } from "@/lib/recent-searches"
import { parseLocalDate } from "@/lib/flight-utils"
import { ScrollToTop } from "@/components/scroll-to-top"

export default function FlightSearchPage() {
  const urlSearchParams = useSearchParams()
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null)
  const [flights, setFlights] = useState<FlightOffer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>("best")
  const [urlRestored, setUrlRestored] = useState(false)


  const handleSearch = useCallback(async (params: SearchParams) => {
    setIsLoading(true)
    setSearchParams(params)
    setHasSearched(true)

    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originLocationCode: params.origin!.iataCode,
          destinationLocationCode: params.destination!.iataCode,
          departureDate: toLocalDateString(params.departureDate!),
          returnDate: params.tripType === "round-trip" && params.returnDate
            ? toLocalDateString(params.returnDate)
            : undefined,
          adults: params.passengers.adults,
          children: params.passengers.children,
          infants: params.passengers.infants,
          travelClass: params.cabinClass,
          max: 50,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to search flights")
      }

      const { data } = await response.json()
      setFlights(data)

      // Save to recent searches
      saveRecentSearch(params)

      const priceRange = getPriceRange(data)
      const durationRange = getDurationRange(data)
      setFilters({
        ...DEFAULT_FILTERS,
        priceRange,
        duration: durationRange[1],
      })

      // Update URL with search params for sharing
      const urlParams = new URLSearchParams()
      urlParams.set("from", params.origin!.iataCode)
      urlParams.set("fromCity", params.origin!.cityName)
      urlParams.set("fromName", params.origin!.name || "")
      urlParams.set("to", params.destination!.iataCode)
      urlParams.set("toCity", params.destination!.cityName)
      urlParams.set("toName", params.destination!.name || "")
      urlParams.set("dep", toLocalDateString(params.departureDate!))
      if (params.tripType === "round-trip" && params.returnDate) {
        urlParams.set("ret", toLocalDateString(params.returnDate))
      }
      urlParams.set("type", params.tripType)
      urlParams.set("adults", String(params.passengers.adults))
      if (params.passengers.children > 0) urlParams.set("children", String(params.passengers.children))
      if (params.passengers.infants > 0) urlParams.set("infants", String(params.passengers.infants))
      urlParams.set("class", params.cabinClass)

      window.history.replaceState({}, "", `?${urlParams.toString()}`)
    } catch (error) {
      console.error("Search error:", error)
      setFlights([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Restore search from URL params on page load
  useEffect(() => {
    if (urlRestored) return

    const from = urlSearchParams.get("from")
    const to = urlSearchParams.get("to")
    const dep = urlSearchParams.get("dep")

    if (from && to && dep) {
      const params: SearchParams = {
        origin: {
          iataCode: from,
          cityName: urlSearchParams.get("fromCity") || from,
          name: urlSearchParams.get("fromName") || "",
          countryCode: "",
        },
        destination: {
          iataCode: to,
          cityName: urlSearchParams.get("toCity") || to,
          name: urlSearchParams.get("toName") || "",
          countryCode: "",
        },
        departureDate: parseLocalDate(dep),
        returnDate: urlSearchParams.get("ret") ? parseLocalDate(urlSearchParams.get("ret")!) : null,
        tripType: (urlSearchParams.get("type") as "one-way" | "round-trip") || "round-trip",
        passengers: {
          adults: parseInt(urlSearchParams.get("adults") || "1"),
          children: parseInt(urlSearchParams.get("children") || "0"),
          infants: parseInt(urlSearchParams.get("infants") || "0"),
        },
        cabinClass: (urlSearchParams.get("class") || "ECONOMY") as "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST",
      }
      setUrlRestored(true)
      handleSearch(params)
    } else {
      setUrlRestored(true)
    }
  }, [urlSearchParams, urlRestored, handleSearch])


  const handleDateSelectFromGraph = useCallback(
    async (selectedDate: Date, returnDate?: Date) => {
      if (!searchParams) return

      let newReturnDate = returnDate

      if (!newReturnDate && searchParams.tripType === "round-trip") {
        const tripDuration =
          searchParams.returnDate && searchParams.departureDate
            ? Math.ceil(
              (searchParams.returnDate.getTime() - searchParams.departureDate.getTime()) / (24 * 60 * 60 * 1000),
            )
            : 7
        newReturnDate = new Date(selectedDate.getTime() + tripDuration * 24 * 60 * 60 * 1000)
      }

      const newParams: SearchParams = {
        ...searchParams,
        departureDate: selectedDate,
        returnDate: newReturnDate || null,
      }

      await handleSearch(newParams)
    },
    [searchParams, handleSearch],
  )

  const filteredFlights = useMemo(() => {
    let result = [...flights]

    // Apply stops filter
    if (filters.stops.length > 0) {
      result = result.filter((flight) => {
        const stops = getStopsCount(flight.itineraries[0].segments)
        return filters.stops.some((filterStop) => {
          if (filterStop === 2) return stops >= 2
          return stops === filterStop
        })
      })
    }

    // Apply price filter
    result = result.filter((flight) => {
      const price = Number.parseFloat(flight.price.grandTotal)
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    // Apply airlines filter
    if (filters.airlines.length > 0) {
      result = result.filter((flight) =>
        flight.itineraries.some((itinerary) =>
          itinerary.segments.some((segment) => filters.airlines.includes(segment.carrierCode)),
        ),
      )
    }

    // Apply departure time filter
    if (filters.departureTimeRange[0] > 0 || filters.departureTimeRange[1] < 24) {
      result = result.filter((flight) => {
        const depHour = getHourFromDateTime(flight.itineraries[0].segments[0].departure.at)
        return depHour >= filters.departureTimeRange[0] && depHour <= filters.departureTimeRange[1]
      })
    }

    result = result.filter((flight) => {
      const duration = getDurationInMinutes(flight.itineraries[0].duration)
      return duration <= filters.duration
    })

    if (filters.bags.carryOn) {
      result = result.filter((flight) => flight.baggageInfo?.carryOn.included === true)
    }
    if (filters.bags.checked > 0) {
      result = result.filter((flight) => {
        const checkedBags = flight.baggageInfo?.checked.quantity || 0
        return checkedBags >= filters.bags.checked
      })
    }

    if (filters.connectingAirports.length > 0) {
      result = result.filter((flight) => {
        const flightConnections = new Set<string>()
        flight.itineraries.forEach((itinerary) => {
          itinerary.segments.forEach((segment, idx) => {
            if (idx > 0) flightConnections.add(segment.departure.iataCode)
            if (idx < itinerary.segments.length - 1) flightConnections.add(segment.arrival.iataCode)
          })
        })

        // If no connections (nonstop), allow the flight
        if (flightConnections.size === 0) return true

        const hasSelectedAirport = filters.connectingAirports.some((code) => flightConnections.has(code))

        // excludeConnectingAirports: true means we EXCLUDE selected airports
        // excludeConnectingAirports: false means we INCLUDE only selected airports
        return filters.excludeConnectingAirports ? !hasSelectedAirport : hasSelectedAirport
      })
    }

    // Sort results
    result.sort((a, b) => {
      switch (sortBy) {
        case "best": {
          // Best combines price and duration with a weighted score
          // Normalize price (lower is better) and duration (shorter is better)
          const prices = result.map(f => parseFloat(f.price.grandTotal))
          const durations = result.map(f => getDurationInMinutes(f.itineraries[0].duration))
          const minPrice = Math.min(...prices)
          const maxPrice = Math.max(...prices)
          const minDuration = Math.min(...durations)
          const maxDuration = Math.max(...durations)

          const priceRange = maxPrice - minPrice || 1
          const durationRange = maxDuration - minDuration || 1

          const scoreA = 0.6 * ((parseFloat(a.price.grandTotal) - minPrice) / priceRange) +
            0.4 * ((getDurationInMinutes(a.itineraries[0].duration) - minDuration) / durationRange)
          const scoreB = 0.6 * ((parseFloat(b.price.grandTotal) - minPrice) / priceRange) +
            0.4 * ((getDurationInMinutes(b.itineraries[0].duration) - minDuration) / durationRange)
          return scoreA - scoreB
        }
        case "price":
          return parseFloat(a.price.grandTotal) - parseFloat(b.price.grandTotal)
        case "duration":
          return getDurationInMinutes(a.itineraries[0].duration) - getDurationInMinutes(b.itineraries[0].duration)
        default:
          return 0
      }
    })

    return result
  }, [flights, filters, sortBy])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Plane className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">SkySearch</span>
          </a>
          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-6 text-sm md:flex">
              <a href="/" className="font-medium text-foreground">
                Flights
              </a>
              <a href="/hotels" className="text-muted-foreground hover:text-foreground">
                Hotels
              </a>
              <a href="/car-rental" className="text-muted-foreground hover:text-foreground">
                Car Rental
              </a>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero / Search Section */}
      <section className="border-b border-border bg-card pb-8 pt-8 md:pt-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 text-center md:mb-8">
            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Find your next adventure
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground md:text-lg">
              Search hundreds of airlines and find the best deals on flights worldwide.
            </p>
          </div>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </section>

      {/* Results Section */}
      <section className="py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-4">
          {isLoading ? (
            <LoadingSkeleton isRoundTrip={searchParams?.tripType === "round-trip"} />
          ) : !hasSearched ? (
            <>
              <EmptyState type="no-search" />
              <RecentSearches
                onSelectSearch={(search) => {
                  const params: SearchParams = {
                    origin: search.origin,
                    destination: search.destination,
                    departureDate: parseLocalDate(search.departureDate),
                    returnDate: search.returnDate ? parseLocalDate(search.returnDate) : null,
                    tripType: search.tripType,
                    passengers: search.passengers,
                    cabinClass: "ECONOMY",
                  }
                  handleSearch(params)
                }}
              />
            </>
          ) : flights.length === 0 ? (
            <EmptyState type="no-results" />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              {/* Filters Sidebar */}
              <FlightFilters
                flights={flights}
                filters={filters}
                onFiltersChange={setFilters}
                filteredCount={filteredFlights.length}
              />

              {/* Results */}
              <div className="space-y-4">
                {searchParams && (
                  <ResultsHeader
                    searchParams={searchParams}
                    resultCount={flights.length}
                    filteredCount={filteredFlights.length}
                    flights={flights}
                  />
                )}

                {/* Price Graph */}
                <PriceGraph searchParams={searchParams} filters={filters} flights={flights} filteredFlights={filteredFlights} onDateSelect={handleDateSelectFromGraph} />

                {/* Sort & Count */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="lg:hidden">
                    <FlightFilters
                      flights={flights}
                      filters={filters}
                      onFiltersChange={setFilters}
                      filteredCount={filteredFlights.length}
                    />
                  </div>
                  <SortOptions value={sortBy} onChange={setSortBy} />
                </div>

                {/* Flight Cards */}
                {filteredFlights.length === 0 ? (
                  <EmptyState
                    type="no-filtered"
                    onClearFilters={() => setFilters({
                      ...DEFAULT_FILTERS,
                      priceRange: getPriceRange(flights),
                      duration: getDurationRange(flights)[1],
                    })}
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredFlights.map((flight) => (
                      <FlightCard
                        key={flight.id}
                        flight={flight}
                        isRoundTrip={searchParams?.tripType === "round-trip"}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Plane className="h-4 w-4" />
              </div>
              <span className="font-semibold text-foreground">SkySearch</span>
            </div>
            <p>Search and compare flights from hundreds of airlines.</p>
            <div className="flex gap-4">
              <a href="/privacy" className="hover:text-foreground">
                Privacy
              </a>
              <a href="/terms" className="hover:text-foreground">
                Terms
              </a>
              <a href="/support" className="hover:text-foreground">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  )
}
