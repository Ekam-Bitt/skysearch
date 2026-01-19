"use client"

import { useState } from "react"
import { ArrowLeftRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SearchParams } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { AirportSearch } from "./airport-search"
import { DatePicker } from "./date-picker"
import { PassengerSelector } from "./passenger-selector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
  isLoading?: boolean
}

export function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [params, setParams] = useState<SearchParams>({
    origin: null,
    destination: null,
    departureDate: null,
    returnDate: null,
    tripType: "round-trip",
    passengers: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    cabinClass: "ECONOMY",
  })

  const handleSwapAirports = () => {
    setParams((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }))
  }

  const handleSearch = () => {
    if (params.origin && params.destination && params.departureDate) {
      onSearch(params)
    }
  }

  const isValid =
    params.origin && params.destination && params.departureDate && (params.tripType === "one-way" || params.returnDate)

  return (
    <div className="rounded-2xl bg-card p-4 shadow-lg shadow-primary/5 md:p-6">
      {/* Trip Type & Cabin Class */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-secondary p-1">
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, tripType: "round-trip", returnDate: null }))}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              params.tripType === "round-trip"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Round trip
          </button>
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, tripType: "one-way", returnDate: null }))}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              params.tripType === "one-way"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            One way
          </button>
        </div>

        <Select
          name="cabinClass"
          value={params.cabinClass}
          onValueChange={(value) =>
            setParams((p) => ({
              ...p,
              cabinClass: value as SearchParams["cabinClass"],
            }))
          }
        >
          <SelectTrigger className="w-auto gap-2 border-0 bg-secondary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ECONOMY">Economy</SelectItem>
            <SelectItem value="PREMIUM_ECONOMY">Premium Economy</SelectItem>
            <SelectItem value="BUSINESS">Business</SelectItem>
            <SelectItem value="FIRST">First Class</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search Fields */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_1fr_auto]">
        {/* Origin */}
        <div className="relative">
          <AirportSearch
            value={params.origin}
            onChange={(airport) => setParams((p) => ({ ...p, origin: airport }))}
            placeholder="Where from?"
            label="From"
            icon="departure"
            excludeCode={params.destination?.iataCode}
          />
        </div>

        {/* Swap Button */}
        <div className="hidden items-center justify-center lg:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSwapAirports}
            className="h-10 w-10 rounded-full hover:bg-secondary"
            disabled={!params.origin && !params.destination}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span className="sr-only">Swap airports</span>
          </Button>
        </div>

        {/* Destination */}
        <div>
          <AirportSearch
            value={params.destination}
            onChange={(airport) => setParams((p) => ({ ...p, destination: airport }))}
            placeholder="Where to?"
            label="To"
            icon="arrival"
            excludeCode={params.origin?.iataCode}
          />
        </div>

        {/* Departure Date */}
        <DatePicker
          value={params.departureDate}
          onChange={(date) => setParams((p) => ({ ...p, departureDate: date }))}
          label="Departure"
          placeholder="Add date"
          minDate={new Date()}
        />

        {/* Return Date */}
        <DatePicker
          value={params.returnDate}
          onChange={(date) => setParams((p) => ({ ...p, returnDate: date }))}
          label="Return"
          placeholder="Add date"
          minDate={params.departureDate || new Date()}
          disabled={params.tripType === "one-way"}
        />

        {/* Passengers */}
        <div className="md:col-span-2 lg:col-span-1">
          <PassengerSelector
            value={params.passengers}
            onChange={(passengers) => setParams((p) => ({ ...p, passengers }))}
          />
        </div>
      </div>

      {/* Mobile Swap Button */}
      <div className="my-3 flex justify-center lg:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSwapAirports}
          className="gap-2 bg-transparent"
          disabled={!params.origin && !params.destination}
        >
          <ArrowLeftRight className="h-4 w-4" />
          Swap
        </Button>
      </div>

      {/* Search Button */}
      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleSearch}
          disabled={!isValid || isLoading}
          size="lg"
          className="w-full gap-2 rounded-xl px-8 md:w-auto"
        >
          <Search className="h-5 w-5" />
          {isLoading ? "Searching..." : "Search flights"}
        </Button>
      </div>
    </div>
  )
}
