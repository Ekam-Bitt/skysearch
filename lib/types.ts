export interface Airport {
  iataCode: string
  name: string
  cityName: string
  countryCode: string
}

export interface FlightSegment {
  departure: {
    iataCode: string
    terminal?: string
    at: string
  }
  arrival: {
    iataCode: string
    terminal?: string
    at: string
  }
  carrierCode: string
  carrierName?: string
  number: string
  aircraft: {
    code: string
  }
  duration: string
  numberOfStops: number
}

export interface FlightItinerary {
  duration: string
  segments: FlightSegment[]
}

export interface BaggageInfo {
  carryOn: {
    included: boolean
    quantity: number
  }
  checked: {
    included: boolean
    quantity: number
    weight?: string
  }
}

export interface FlightOffer {
  id: string
  source: string
  instantTicketingRequired: boolean
  price: {
    currency: string
    total: string
    base: string
    grandTotal: string
  }
  itineraries: FlightItinerary[]
  travelerPricings: {
    travelerId: string
    fareOption: string
    travelerType: string
    price: {
      currency: string
      total: string
    }
    fareDetailsBySegment: {
      segmentId: string
      cabin: string
      class: string
      brandedFare?: string
    }[]
  }[]
  validatingAirlineCodes: string[]
  numberOfBookableSeats?: number
  baggageInfo?: BaggageInfo
}

export interface SearchParams {
  origin: Airport | null
  destination: Airport | null
  departureDate: Date | null
  returnDate: Date | null
  tripType: "one-way" | "round-trip"
  passengers: {
    adults: number
    children: number
    infants: number
  }
  cabinClass: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"
}

export interface FilterState {
  stops: number[]
  priceRange: [number, number]
  airlines: string[]
  departureTimeRange: [number, number]
  arrivalTimeRange: [number, number]
  duration: number
  bags: {
    carryOn: boolean
    checked: number
  }
  connectingAirports: string[]
  excludeConnectingAirports: boolean
}

export interface PriceDataPoint {
  date: string
  price: number
  available: boolean
}



export const DEFAULT_FILTERS: FilterState = {
  stops: [],
  priceRange: [0, 5000],
  airlines: [],
  departureTimeRange: [0, 24],
  arrivalTimeRange: [0, 24],
  duration: 2880,
  bags: {
    carryOn: false,
    checked: 0,
  },
  connectingAirports: [],
  excludeConnectingAirports: true,
}

export interface DateGridCell {
  departureDate: string
  returnDate: string
  price: number
  available: boolean
  isLowest: boolean
  isSelected: boolean
  tripDuration: number
}

export interface DateGridData {
  departureDates: string[]
  returnDates: string[]
  cells: Map<string, DateGridCell>
  lowestPrice: number
  highestPrice: number
}

export interface DatePriceData {
  date: string
  displayDate: string
  price: number
  lowestPrice: number
  available: boolean
  isWeekend: boolean
  isSelected: boolean
}
