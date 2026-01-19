import { getAirportSearch } from "@/lib/amadeus"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get("keyword")

    if (!keyword || keyword.length < 1) {
      return Response.json(
        { error: "Keyword is required" },
        { status: 400 },
      )
    }

    const airports = await getAirportSearch(keyword)

    const transformed = airports.map((airport: any) => ({
      iataCode: airport.iataCode,
      name: airport.name,
      cityName: airport.address?.cityName || airport.name,
      countryCode: airport.address?.countryCode || "",
    }))

    return Response.json({ data: transformed })
  } catch (error) {
    console.error("Airport search error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Airport search failed" },
      { status: 500 },
    )
  }
}
