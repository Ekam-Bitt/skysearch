import { searchFlights, transformAmadeusOffer } from "@/lib/amadeus"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      travelClass,
      currencyCode,
      max,
    } = body

    if (!originLocationCode || !destinationLocationCode || !departureDate || adults === undefined) {
      return Response.json(
        { error: "Missing required parameters" },
        { status: 400 },
      )
    }

    const offers = await searchFlights({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      travelClass,
      currencyCode,
      max,
    })

    const transformedOffers = offers.map(transformAmadeusOffer)

    return Response.json({ data: transformedOffers })
  } catch (error) {
    console.error("Flight search error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Flight search failed" },
      { status: (error as any).status || 500 },
    )
  }
}
