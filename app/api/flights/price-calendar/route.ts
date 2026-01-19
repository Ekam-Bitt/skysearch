import { searchFlights, transformAmadeusOffer } from "@/lib/amadeus"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
      children,
      infants,
      cabinClass,
      currencyCode,
      daysAhead = 60,
    } = body

    if (!originLocationCode || !destinationLocationCode || !departureDate || adults === undefined) {
      return Response.json(
        { error: "Missing required parameters" },
        { status: 400 },
      )
    }

    const priceData: Record<string, any> = {}
    const startDate = new Date(departureDate)

    // Generate price data for multiple dates
    for (let i = 0; i < daysAhead; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(currentDate.getDate() + i)
      const dateStr = currentDate.toISOString().split("T")[0]

      try {
        const offers = await searchFlights({
          originLocationCode,
          destinationLocationCode,
          departureDate: dateStr,
          adults,
          children,
          infants,
          travelClass: cabinClass,
          currencyCode,
          max: 1,
        })

        if (offers.length > 0) {
          const lowestPrice = Math.min(...offers.map((o: any) => parseFloat(o.price.grandTotal)))
          priceData[dateStr] = {
            price: lowestPrice,
            available: true,
          }
        } else {
          priceData[dateStr] = {
            price: null,
            available: false,
          }
        }
      } catch (error) {
        // Continue with next date if one fails
        priceData[dateStr] = {
          price: null,
          available: false,
        }
      }
    }

    return Response.json({ data: priceData })
  } catch (error) {
    console.error("Price calendar error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Price calendar generation failed" },
      { status: 500 },
    )
  }
}
