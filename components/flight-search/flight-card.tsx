"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Clock, Plane, Wifi, Plug, Tv } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FlightOffer, FlightItinerary } from "@/lib/types"
import {
  formatDuration,
  formatTime,
  formatDate,
  formatPrice,
  getStopsCount,
  getStopsLabel,
  getAirlineName,
  getLayoverDuration,
  getAircraftName,
  getEstimatedAmenities,
} from "@/lib/flight-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AirlineLogo } from "@/components/flight-search/airline-logo"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FlightCardProps {
  flight: FlightOffer
  isRoundTrip?: boolean
}

export function FlightCard({ flight, isRoundTrip = false }: FlightCardProps) {
  const [expanded, setExpanded] = useState(false)
  const outbound = flight.itineraries[0]
  const returnTrip = flight.itineraries[1]
  const airline = getAirlineName(flight.validatingAirlineCodes[0])
  const price = formatPrice(flight.price.grandTotal, flight.price.currency)

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md">
      <div className="p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Flight Info */}
          <div className="flex-1 space-y-4">
            {/* Outbound */}
            <ItineraryRow itinerary={outbound} label={isRoundTrip ? "Outbound" : undefined} />

            {/* Return */}
            {isRoundTrip && returnTrip && (
              <>
                <div className="border-t border-dashed border-border" />
                <ItineraryRow itinerary={returnTrip} label="Return" />
              </>
            )}
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{price}</p>
              <p className="text-sm text-muted-foreground">per person</p>
            </div>
            <Button className="shrink-0">Select</Button>
          </div>
        </div>

        {/* Airline & Details Toggle */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <AirlineLogo code={flight.validatingAirlineCodes[0]} name={airline} size="md" />
            <span className="text-sm text-muted-foreground">{airline}</span>
            {flight.numberOfBookableSeats && flight.numberOfBookableSeats <= 4 && (
              <Badge variant="destructive" className="ml-2">
                {flight.numberOfBookableSeats} left
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="gap-1 text-muted-foreground"
          >
            {expanded ? (
              <>
                Hide details
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Flight details
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border bg-muted/30 p-4 md:p-5">
          <div className="space-y-6">
            <FlightDetails itinerary={outbound} label={isRoundTrip ? "Outbound Flight" : "Flight Details"} />
            {isRoundTrip && returnTrip && <FlightDetails itinerary={returnTrip} label="Return Flight" />}
          </div>
        </div>
      )}
    </div>
  )
}

function ItineraryRow({
  itinerary,
  label,
}: {
  itinerary: FlightItinerary
  label?: string
}) {
  const firstSegment = itinerary.segments[0]
  const lastSegment = itinerary.segments[itinerary.segments.length - 1]
  const stops = getStopsCount(itinerary.segments)

  const renderStopsInfo = () => {
    if (stops === 0) return null

    const airportInfo: Record<string, string> = {
      // North America
      ORD: "Chicago, USA",
      DFW: "Dallas, USA",
      ATL: "Atlanta, USA",
      DEN: "Denver, USA",
      JFK: "New York, USA",
      LAX: "Los Angeles, USA",
      SFO: "San Francisco, USA",
      MIA: "Miami, USA",
      SEA: "Seattle, USA",
      BOS: "Boston, USA",
      LAS: "Las Vegas, USA",
      PHX: "Phoenix, USA",
      IAH: "Houston, USA",
      EWR: "Newark, USA",
      DTW: "Detroit, USA",
      MSP: "Minneapolis, USA",
      CLT: "Charlotte, USA",
      PHL: "Philadelphia, USA",
      YYZ: "Toronto, Canada",
      YVR: "Vancouver, Canada",
      YUL: "Montreal, Canada",
      MEX: "Mexico City, Mexico",
      CUN: "Cancun, Mexico",
      // Europe
      LHR: "London, UK",
      LGW: "London Gatwick, UK",
      FRA: "Frankfurt, Germany",
      MUC: "Munich, Germany",
      AMS: "Amsterdam, Netherlands",
      CDG: "Paris, France",
      ORY: "Paris Orly, France",
      MAD: "Madrid, Spain",
      BCN: "Barcelona, Spain",
      FCO: "Rome, Italy",
      MXP: "Milan, Italy",
      ZRH: "Zurich, Switzerland",
      VIE: "Vienna, Austria",
      CPH: "Copenhagen, Denmark",
      OSL: "Oslo, Norway",
      ARN: "Stockholm, Sweden",
      HEL: "Helsinki, Finland",
      IST: "Istanbul, Turkey",
      // Middle East
      DXB: "Dubai, UAE",
      AUH: "Abu Dhabi, UAE",
      DOH: "Doha, Qatar",
      JED: "Jeddah, Saudi Arabia",
      RUH: "Riyadh, Saudi Arabia",
      BAH: "Bahrain",
      KWI: "Kuwait City, Kuwait",
      MCT: "Muscat, Oman",
      TLV: "Tel Aviv, Israel",
      // Asia
      SIN: "Singapore",
      HKG: "Hong Kong",
      NRT: "Tokyo Narita, Japan",
      HND: "Tokyo Haneda, Japan",
      KIX: "Osaka, Japan",
      ICN: "Seoul, South Korea",
      PEK: "Beijing, China",
      PVG: "Shanghai, China",
      CAN: "Guangzhou, China",
      BKK: "Bangkok, Thailand",
      KUL: "Kuala Lumpur, Malaysia",
      CGK: "Jakarta, Indonesia",
      MNL: "Manila, Philippines",
      // India
      DEL: "Delhi, India",
      BOM: "Mumbai, India",
      BLR: "Bangalore, India",
      CCU: "Kolkata, India",
      MAA: "Chennai, India",
      HYD: "Hyderabad, India",
      COK: "Kochi, India",
      GOI: "Goa, India",
      AMD: "Ahmedabad, India",
      PNQ: "Pune, India",
      // Oceania
      SYD: "Sydney, Australia",
      MEL: "Melbourne, Australia",
      BNE: "Brisbane, Australia",
      PER: "Perth, Australia",
      AKL: "Auckland, New Zealand",
      // Africa
      JNB: "Johannesburg, South Africa",
      CPT: "Cape Town, South Africa",
      CAI: "Cairo, Egypt",
      ADD: "Addis Ababa, Ethiopia",
      NBO: "Nairobi, Kenya",
      CMN: "Casablanca, Morocco",
      LOS: "Lagos, Nigeria",
    }

    const stopsList = itinerary.segments.slice(0, -1).map((segment, idx) => {
      const layoverStr = getLayoverDuration(segment.arrival.at, itinerary.segments[idx + 1].departure.at)
      // Parse layover duration to minutes for summing
      let layoverMinutes = 0
      if (layoverStr) {
        const hoursMatch = layoverStr.match(/(\d+)h/)
        const minsMatch = layoverStr.match(/(\d+)m/)
        if (hoursMatch) layoverMinutes += parseInt(hoursMatch[1]) * 60
        if (minsMatch) layoverMinutes += parseInt(minsMatch[1])
      }
      return {
        airport: segment.arrival.iataCode,
        cityCountry: airportInfo[segment.arrival.iataCode] || segment.arrival.iataCode,
        layover: layoverStr,
        layoverMinutes,
      }
    })

    const totalLayoverMinutes = stopsList.reduce((sum, stop) => sum + stop.layoverMinutes, 0)
    const totalHours = Math.floor(totalLayoverMinutes / 60)
    const totalMins = totalLayoverMinutes % 60
    const totalLayoverStr = `${totalHours}h ${totalMins}m`

    return (
      <div className="space-y-2">
        <p className="font-semibold text-sm">{stops} Stop{stops > 1 ? "s" : ""}</p>
        {stopsList.map((stop, idx) => (
          <div key={idx} className="text-sm">
            <p className="text-muted-foreground">
              {stop.airport} ({stop.cityCountry}) - {stop.layover}
            </p>
          </div>
        ))}
        <div className="border-t border-border pt-2 mt-2">
          <p className="text-sm font-semibold">Total Layover: {totalLayoverStr}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}
      <div className="flex items-center gap-4">
        {/* Departure */}
        <div className="text-center">
          <p className="text-lg font-bold md:text-xl">{formatTime(firstSegment.departure.at)}</p>
          <p className="text-sm text-muted-foreground">{firstSegment.departure.iataCode}</p>
        </div>

        {/* Flight Path */}
        <div className="flex flex-1 flex-col items-center">
          <div className="flex w-full items-center gap-1">
            <div className="h-[2px] flex-1 bg-border" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <Plane className="h-4 w-4 rotate-90 text-muted-foreground hover:text-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                {stops > 0 && <TooltipContent side="top" className="max-w-xs">{renderStopsInfo()}</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
            <div className="h-[2px] flex-1 bg-border" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(itinerary.duration)}</span>
            <span className="text-border">•</span>
            <span className={cn(stops === 0 && "text-accent")}>{getStopsLabel(stops)}</span>
          </div>
        </div>

        {/* Arrival */}
        <div className="text-center">
          <p className="text-lg font-bold md:text-xl">{formatTime(lastSegment.arrival.at)}</p>
          <p className="text-sm text-muted-foreground">{lastSegment.arrival.iataCode}</p>
        </div>
      </div>
    </div>
  )
}

function FlightDetails({
  itinerary,
  label,
}: {
  itinerary: FlightItinerary
  label: string
}) {
  return (
    <div>
      <h4 className="mb-3 font-semibold">{label}</h4>
      <div className="space-y-4">
        {itinerary.segments.map((segment, idx) => (
          <div key={idx}>
            {idx > 0 && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Layover in {segment.departure.iataCode}:{" "}
                  {getLayoverDuration(itinerary.segments[idx - 1].arrival.at, segment.departure.at)}
                </span>
              </div>
            )}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full border-2 border-primary bg-card" />
                <div className="w-0.5 flex-1 bg-border" />
                <div className="h-3 w-3 rounded-full border-2 border-primary bg-primary" />
              </div>
              <div className="flex-1 space-y-4 pb-2">
                <div>
                  <p className="font-medium">
                    {formatTime(segment.departure.at)} · {segment.departure.iataCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(segment.departure.at)}
                    {segment.departure.terminal && ` · Terminal ${segment.departure.terminal}`}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Plane className="h-4 w-4" />
                    <span>
                      {getAirlineName(segment.carrierCode)} {segment.number} · {formatDuration(segment.duration)}
                    </span>
                  </div>
                  {/* Aircraft Type and Amenities */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="rounded bg-secondary px-2 py-0.5 font-medium">
                      {getAircraftName(segment.aircraft.code)}
                    </span>
                    {(() => {
                      const amenities = getEstimatedAmenities(segment.aircraft.code)
                      return (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {amenities.wifi && (
                            <span className="flex items-center gap-1" title="Wi-Fi available">
                              <Wifi className="h-3.5 w-3.5 text-primary" />
                              <span>Wi-Fi</span>
                            </span>
                          )}
                          {amenities.power && (
                            <span className="flex items-center gap-1" title="Power outlets">
                              <Plug className="h-3.5 w-3.5 text-primary" />
                              <span>Power</span>
                            </span>
                          )}
                          {amenities.entertainment && (
                            <span className="flex items-center gap-1" title="In-flight entertainment">
                              <Tv className="h-3.5 w-3.5 text-primary" />
                              <span>Entertainment</span>
                            </span>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>
                <div>
                  <p className="font-medium">
                    {formatTime(segment.arrival.at)} · {segment.arrival.iataCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(segment.arrival.at)}
                    {segment.arrival.terminal && ` · Terminal ${segment.arrival.terminal}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
