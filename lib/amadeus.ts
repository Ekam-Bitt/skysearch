let cachedToken: string | null = null
let tokenExpiresAt: number = 0

async function getAmadeusToken(): Promise<string> {
  const now = Date.now()

  // Return cached token if still valid
  if (cachedToken && tokenExpiresAt > now) {
    return cachedToken
  }

  const clientId = process.env.AMADEUS_CLIENT_ID
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Missing Amadeus API credentials")
  }

  const response = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  })

  if (!response.ok) {
    const error = new Error(`Failed to get Amadeus token: ${response.statusText}`) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  const data = await response.json()
  cachedToken = data.access_token
  tokenExpiresAt = now + data.expires_in * 1000 - 60000 // Refresh 1 minute before expiry

  return cachedToken || ""
}

export async function searchFlights(params: {
  originLocationCode: string
  destinationLocationCode: string
  departureDate: string
  returnDate?: string
  adults: number
  children?: number
  infants?: number
  travelClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"
  currencyCode?: string
  max?: number
}) {
  const token = await getAmadeusToken()

  const searchParams = new URLSearchParams({
    originLocationCode: params.originLocationCode,
    destinationLocationCode: params.destinationLocationCode,
    departureDate: params.departureDate,
    adults: params.adults.toString(),
    currencyCode: params.currencyCode || "USD",
  })

  // Add max parameter (limit results to 1-250)
  if (params.max) {
    searchParams.append("max", Math.min(Math.max(params.max, 1), 250).toString())
  }

  if (params.returnDate) {
    searchParams.append("returnDate", params.returnDate)
  }
  if (params.children) {
    searchParams.append("children", params.children.toString())
  }
  if (params.infants) {
    searchParams.append("infants", params.infants.toString())
  }
  if (params.travelClass) {
    searchParams.append("travelClass", params.travelClass)
  }

  const response = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.amadeus+json",
    },
  })

  if (!response.ok) {
    const error = new Error(`Flight search failed: ${response.statusText}`) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  const data = await response.json()
  return data.data || []
}

export async function getFlightInspiration(params: {
  origin: string
  maxPrice?: number
  departureDate?: string
}) {
  const token = await getAmadeusToken()

  const searchParams = new URLSearchParams({
    origin: params.origin,
  })

  if (params.maxPrice) {
    searchParams.append("maxPrice", params.maxPrice.toString())
  }
  if (params.departureDate) {
    searchParams.append("departureDate", params.departureDate)
  }

  const response = await fetch(`https://test.api.amadeus.com/v1/reference-data/recommended-locations?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.amadeus+json",
    },
  })

  if (!response.ok) {
    throw new Error(`Flight inspiration search failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

export async function getAirportSearch(keyword: string) {
  const token = await getAmadeusToken()

  const response = await fetch(
    `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(keyword)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.amadeus+json",
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Airport search failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

// Transform Amadeus response to our internal FlightOffer format
export function transformAmadeusOffer(offer: any) {
  return {
    id: offer.id,
    source: offer.source || "GDS",
    instantTicketingRequired: offer.instantTicketingRequired || false,
    price: {
      currency: offer.price.currency,
      total: offer.price.total,
      base: offer.price.base,
      grandTotal: offer.price.grandTotal,
    },
    itineraries: offer.itineraries.map((itinerary: any) => ({
      duration: itinerary.duration,
      segments: itinerary.segments.map((segment: any) => ({
        departure: {
          iataCode: segment.departure.iataCode,
          terminal: segment.departure.terminal,
          at: segment.departure.at,
        },
        arrival: {
          iataCode: segment.arrival.iataCode,
          terminal: segment.arrival.terminal,
          at: segment.arrival.at,
        },
        carrierCode: segment.operating?.carrierCode || segment.carrierCode,
        carrierName: segment.operating?.carrierName,
        number: segment.number,
        aircraft: {
          code: segment.aircraft.code,
        },
        duration: segment.duration,
        numberOfStops: segment.numberOfStops,
      })),
    })),
    travelerPricings: offer.travelerPricings || [],
    validatingAirlineCodes: offer.validatingAirlineCodes || [offer.validatingAirlineCode],
    numberOfBookableSeats: offer.numberOfBookableSeats,
    baggageInfo: extractBaggageInfo(offer),
  }
}

function extractBaggageInfo(offer: any) {
  if (!offer.travelerPricings || offer.travelerPricings.length === 0) {
    return undefined
  }

  const travelerPricing = offer.travelerPricings[0]
  if (!travelerPricing.fareDetailsBySegment) {
    return undefined
  }

  let carryOnIncluded = false
  let checkedIncluded = false
  let checkedQuantity = 0

  travelerPricing.fareDetailsBySegment.forEach((fareDetail: any) => {
    if (fareDetail.includedCheckedBags) {
      checkedIncluded = true
      checkedQuantity = Math.max(checkedQuantity, fareDetail.includedCheckedBags.weight || 1)
    }
  })

  return {
    carryOn: {
      included: carryOnIncluded || true, // Most airlines include 1 carry-on
      quantity: 1,
    },
    checked: {
      included: checkedIncluded,
      quantity: checkedQuantity,
      weight: `${checkedQuantity * 23}kg`,
    },
  }
}
