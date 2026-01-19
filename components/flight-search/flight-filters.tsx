"use client"

import { useMemo } from "react"
import { Filter, X, Briefcase, Luggage, Clock, MapPin } from "lucide-react"
import { type FilterState, type FlightOffer, DEFAULT_FILTERS } from "@/lib/types"
import {
  formatPrice,
  getAirlineName,
  getUniqueAirlines,
  getPriceRange,
  getDurationRange,
  getConnectingAirports,
  formatDurationFromMinutes,
} from "@/lib/flight-utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

interface FlightFiltersProps {
  flights: FlightOffer[]
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  filteredCount: number
}

export function FlightFilters({ flights, filters, onFiltersChange, filteredCount }: FlightFiltersProps) {
  const availableAirlines = useMemo(() => getUniqueAirlines(flights), [flights])
  const priceRange = useMemo(() => getPriceRange(flights), [flights])
  const durationRange = useMemo(() => getDurationRange(flights), [flights])
  const connectingAirports = useMemo(() => getConnectingAirports(flights), [flights])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.stops.length > 0) count++
    if (filters.priceRange[0] > priceRange[0] || filters.priceRange[1] < priceRange[1]) count++
    if (filters.airlines.length > 0) count++
    if (filters.departureTimeRange[0] > 0 || filters.departureTimeRange[1] < 24) count++
    if (filters.duration < durationRange[1]) count++
    if (filters.bags.carryOn || filters.bags.checked > 0) count++
    if (filters.connectingAirports.length > 0) count++
    return count
  }, [filters, priceRange, durationRange])

  const clearFilters = () => {
    onFiltersChange({
      ...DEFAULT_FILTERS,
      priceRange: priceRange,
      duration: durationRange[1],
    })
  }

  const FilterContent = () => (
    <div className="space-y-1">
      <Accordion
        type="multiple"
        defaultValue={["stops", "price", "bags", "duration", "airlines", "times", "connecting"]}
        className="w-full"
      >
        {/* Stops Filter */}
        <AccordionItem value="stops">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2">
              Stops
              {filters.stops.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {filters.stops.length === 1 && filters.stops[0] === 0
                    ? "Nonstop"
                    : filters.stops.length === 2
                      ? "1 stop"
                      : "Active"}
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={
                filters.stops.length === 0
                  ? "any"
                  : filters.stops.length === 1 && filters.stops[0] === 0
                    ? "0"
                    : filters.stops.length === 2 && filters.stops.includes(0) && filters.stops.includes(1)
                      ? "1"
                      : "2"
              }
              onValueChange={(value) => {
                if (value === "any") {
                  onFiltersChange({ ...filters, stops: [] })
                } else if (value === "0") {
                  onFiltersChange({ ...filters, stops: [0] })
                } else if (value === "1") {
                  onFiltersChange({ ...filters, stops: [0, 1] })
                } else {
                  onFiltersChange({ ...filters, stops: [0, 1, 2] })
                }
              }}
              className="space-y-3 pt-2"
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="any" id="stops-any" />
                <Label htmlFor="stops-any" className="cursor-pointer text-sm font-normal">
                  Any number of stops
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="0" id="stops-0" />
                <Label htmlFor="stops-0" className="cursor-pointer text-sm font-normal">
                  Nonstop only
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="1" id="stops-1" />
                <Label htmlFor="stops-1" className="cursor-pointer text-sm font-normal">
                  1 stop or fewer
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="2" id="stops-2" />
                <Label htmlFor="stops-2" className="cursor-pointer text-sm font-normal">
                  2 stops or fewer
                </Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* Bags Filter */}
        <AccordionItem value="bags">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2">
              <Luggage className="h-4 w-4" />
              Bags
              {(filters.bags.carryOn || filters.bags.checked > 0) && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {(filters.bags.carryOn ? 1 : 0) + (filters.bags.checked > 0 ? 1 : 0)}
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="carry-on" className="cursor-pointer text-sm">
                    Carry-on bag included
                  </Label>
                </div>
                <Switch
                  id="carry-on"
                  checked={filters.bags.carryOn}
                  onCheckedChange={(checked) => {
                    onFiltersChange({
                      ...filters,
                      bags: { ...filters.bags, carryOn: checked },
                    })
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Luggage className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Checked bags included</Label>
                </div>
                <RadioGroup
                  value={filters.bags.checked.toString()}
                  onValueChange={(value) => {
                    onFiltersChange({
                      ...filters,
                      bags: { ...filters.bags, checked: Number.parseInt(value) },
                    })
                  }}
                  className="grid grid-cols-3 gap-2"
                >
                  {[
                    { value: "0", label: "Any" },
                    { value: "1", label: "1+" },
                    { value: "2", label: "2+" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center">
                      <RadioGroupItem value={option.value} id={`checked-${option.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`checked-${option.value}`}
                        className="flex w-full cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-popover px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Duration Filter */}
        <AccordionItem value="duration">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration
              {filters.duration < durationRange[1] && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  1
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span>Any</span>
                <span className="font-medium">{formatDurationFromMinutes(filters.duration)}</span>
              </div>
              <Slider
                value={[filters.duration]}
                min={durationRange[0]}
                max={durationRange[1]}
                step={30}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    duration: value[0],
                  })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatDurationFromMinutes(durationRange[0])}</span>
                <span>{formatDurationFromMinutes(durationRange[1])}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2">
              Price
              {(filters.priceRange[0] > priceRange[0] || filters.priceRange[1] < priceRange[1]) && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  1
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span>{formatPrice(filters.priceRange[0])}</span>
                <span>{formatPrice(filters.priceRange[1])}</span>
              </div>
              <Slider
                value={filters.priceRange}
                min={priceRange[0]}
                max={priceRange[1]}
                step={10}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    priceRange: value as [number, number],
                  })
                }
                className="w-full"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Connecting Airports Filter */}
        {connectingAirports.length > 0 && (
          <AccordionItem value="connecting">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Connecting airports
                {filters.connectingAirports.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {filters.connectingAirports.length}
                  </Badge>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="exclude-airports" className="cursor-pointer text-sm text-muted-foreground">
                    {filters.excludeConnectingAirports ? "Exclude selected" : "Include only selected"}
                  </Label>
                  <Switch
                    id="exclude-airports"
                    checked={filters.excludeConnectingAirports}
                    onCheckedChange={(checked) => {
                      onFiltersChange({
                        ...filters,
                        excludeConnectingAirports: checked,
                      })
                    }}
                  />
                </div>
                <div className="max-h-40 space-y-3 overflow-y-auto">
                  {connectingAirports.map((code) => {
                    const airport = getAirportInfo(code)
                    return (
                      <div key={code} className="flex items-center gap-2">
                        <Checkbox
                          id={`airport-${code}`}
                          checked={filters.connectingAirports.includes(code)}
                          onCheckedChange={(checked) => {
                            onFiltersChange({
                              ...filters,
                              connectingAirports: checked
                                ? [...filters.connectingAirports, code]
                                : filters.connectingAirports.filter((a) => a !== code),
                            })
                          }}
                        />
                        <Label htmlFor={`airport-${code}`} className="flex cursor-pointer items-center gap-2 text-sm">
                          <span className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium">{code}</span>
                          <span className="truncate">{airport}</span>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Airlines Filter */}
        <AccordionItem value="airlines">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2">
              Airlines
              {filters.airlines.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {filters.airlines.length}
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="max-h-48 space-y-3 overflow-y-auto pt-2">
              {availableAirlines.map((code) => (
                <div key={code} className="flex items-center gap-2">
                  <Checkbox
                    id={`airline-${code}`}
                    checked={filters.airlines.includes(code)}
                    onCheckedChange={(checked) => {
                      onFiltersChange({
                        ...filters,
                        airlines: checked ? [...filters.airlines, code] : filters.airlines.filter((a) => a !== code),
                      })
                    }}
                  />
                  <Label htmlFor={`airline-${code}`} className="flex cursor-pointer items-center gap-2 text-sm">
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium">{code}</span>
                    <span className="truncate">{getAirlineName(code)}</span>
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Departure Time Filter */}
        <AccordionItem value="times">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2">
              Departure Time
              {(filters.departureTimeRange[0] > 0 || filters.departureTimeRange[1] < 24) && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  1
                </Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span>{formatTimeLabel(filters.departureTimeRange[0])}</span>
                <span>{formatTimeLabel(filters.departureTimeRange[1])}</span>
              </div>
              <Slider
                value={filters.departureTimeRange}
                min={0}
                max={24}
                step={1}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    departureTimeRange: value as [number, number],
                  })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>12:00 AM</span>
                <span>12:00 PM</span>
                <span>11:59 PM</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-4 w-full gap-2">
          <X className="h-4 w-4" />
          Clear all filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="sticky top-4 max-h-[calc(100vh-2rem)] rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount} active</Badge>}
          </div>
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
            <FilterContent />
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>{filteredCount} flights match your criteria</SheetDescription>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto pb-20">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

function formatTimeLabel(hour: number): string {
  if (hour === 0) return "12:00 AM"
  if (hour === 12) return "12:00 PM"
  if (hour === 24) return "11:59 PM"
  if (hour < 12) return `${hour}:00 AM`
  return `${hour - 12}:00 PM`
}

function getAirportInfo(code: string): string {
  return code
}
