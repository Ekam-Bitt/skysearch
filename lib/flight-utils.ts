import { type FlightOffer, type FlightSegment } from "./types"

/**
 * Format a Date to YYYY-MM-DD string in LOCAL timezone (not UTC).
 * This prevents off-by-one errors when the local time is behind UTC.
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse a YYYY-MM-DD string as a local date (not UTC).
 */
export function parseLocalDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00")
}

export function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return duration
  const hours = match[1] ? Number.parseInt(match[1]) : 0
  const minutes = match[2] ? Number.parseInt(match[2]) : 0
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function getStopsCount(segments: FlightSegment[]): number {
  return segments.length - 1
}

export function getStopsLabel(stops: number): string {
  if (stops === 0) return "Nonstop"
  if (stops === 1) return "1 stop"
  return `${stops} stops`
}

export function getAirlineName(code: string): string {
  return code
}

export function getLayoverDuration(arrivalTime: string, departureTime: string): string {
  const arrival = new Date(arrivalTime)
  const departure = new Date(departureTime)
  const diffMs = departure.getTime() - arrival.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function getDurationInMinutes(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return 0
  const hours = match[1] ? Number.parseInt(match[1]) : 0
  const minutes = match[2] ? Number.parseInt(match[2]) : 0
  return hours * 60 + minutes
}

export function getHourFromDateTime(dateString: string): number {
  const date = new Date(dateString)
  return date.getHours() + date.getMinutes() / 60
}

export function formatPrice(price: string | number, currency = "USD"): string {
  const num = typeof price === "string" ? Number.parseFloat(price) : price
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function getUniqueAirlines(flights: FlightOffer[]): string[] {
  const airlines = new Set<string>()
  flights.forEach((flight) => {
    flight.itineraries.forEach((itinerary) => {
      itinerary.segments.forEach((segment) => {
        airlines.add(segment.carrierCode)
      })
    })
  })
  return Array.from(airlines).sort()
}

export function getPriceRange(flights: FlightOffer[]): [number, number] {
  if (flights.length === 0) return [0, 5000]
  const prices = flights.map((f) => Number.parseFloat(f.price.grandTotal))
  return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
}

// Helper functions for new filters
export function getDurationRange(flights: FlightOffer[]): [number, number] {
  if (flights.length === 0) return [0, 2880]
  const durations = flights.map((f) => getDurationInMinutes(f.itineraries[0].duration))
  return [Math.floor(Math.min(...durations)), Math.ceil(Math.max(...durations))]
}

export function getConnectingAirports(flights: FlightOffer[]): string[] {
  const airports = new Set<string>()
  flights.forEach((flight) => {
    flight.itineraries.forEach((itinerary) => {
      // Get all intermediate airports (not first departure or last arrival)
      itinerary.segments.forEach((segment, idx) => {
        if (idx > 0) {
          airports.add(segment.departure.iataCode)
        }
        if (idx < itinerary.segments.length - 1) {
          airports.add(segment.arrival.iataCode)
        }
      })
    })
  })
  return Array.from(airports).sort()
}

export function formatDurationFromMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

// Aircraft code to name mapping for common aircraft
const AIRCRAFT_NAMES: Record<string, string> = {
  // Boeing
  "738": "Boeing 737-800",
  "73H": "Boeing 737-800",
  "739": "Boeing 737-900",
  "737": "Boeing 737",
  "7M8": "Boeing 737 MAX 8",
  "7M9": "Boeing 737 MAX 9",
  "744": "Boeing 747-400",
  "748": "Boeing 747-8",
  "757": "Boeing 757",
  "752": "Boeing 757-200",
  "753": "Boeing 757-300",
  "763": "Boeing 767-300",
  "764": "Boeing 767-400",
  "772": "Boeing 777-200",
  "773": "Boeing 777-300",
  "77W": "Boeing 777-300ER",
  "787": "Boeing 787 Dreamliner",
  "788": "Boeing 787-8",
  "789": "Boeing 787-9",
  "78X": "Boeing 787-10",
  // Airbus
  "319": "Airbus A319",
  "320": "Airbus A320",
  "32N": "Airbus A320neo",
  "321": "Airbus A321",
  "32Q": "Airbus A321neo",
  "332": "Airbus A330-200",
  "333": "Airbus A330-300",
  "338": "Airbus A330-800neo",
  "339": "Airbus A330-900neo",
  "342": "Airbus A340-200",
  "343": "Airbus A340-300",
  "346": "Airbus A340-600",
  "351": "Airbus A350-900",
  "359": "Airbus A350-900",
  "35K": "Airbus A350-1000",
  "380": "Airbus A380",
  "388": "Airbus A380-800",
  // Embraer
  "E70": "Embraer E170",
  "E75": "Embraer E175",
  "E90": "Embraer E190",
  "E95": "Embraer E195",
  "E7W": "Embraer E175",
  "E9W": "Embraer E195",
  // CRJ
  "CR2": "Bombardier CRJ-200",
  "CR7": "Bombardier CRJ-700",
  "CR9": "Bombardier CRJ-900",
  "CRJ": "Bombardier CRJ",
  // ATR
  "AT7": "ATR 72",
  "ATR": "ATR",
  // Dash
  "DH4": "Dash 8-400",
}

export function getAircraftName(code: string): string {
  return AIRCRAFT_NAMES[code] || code
}

// Amenity icons based on aircraft type (estimation since Amadeus doesn't provide detailed amenities)
export function getEstimatedAmenities(aircraftCode: string): { wifi: boolean; power: boolean; entertainment: boolean } {
  // Wide-body aircraft typically have all amenities
  const wideBody = ["744", "748", "763", "764", "772", "773", "77W", "787", "788", "789", "78X", "332", "333", "338", "339", "342", "343", "346", "351", "359", "35K", "380", "388"]
  // Narrow-body with good amenities
  const modernNarrow = ["7M8", "7M9", "32N", "32Q", "321"]

  if (wideBody.includes(aircraftCode)) {
    return { wifi: true, power: true, entertainment: true }
  }
  if (modernNarrow.includes(aircraftCode)) {
    return { wifi: true, power: true, entertainment: false }
  }
  // Default for older/smaller aircraft
  return { wifi: false, power: false, entertainment: false }
}

