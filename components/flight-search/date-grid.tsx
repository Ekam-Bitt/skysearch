"use client"

import { useMemo, useState, useCallback, useEffect, Fragment } from "react"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Sparkles, Loader2 } from "lucide-react"
import { formatPrice, toLocalDateString } from "@/lib/flight-utils"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SearchParams, DateGridCell, DateGridData, FlightOffer } from "@/lib/types"

interface DateGridProps {
  searchParams: SearchParams | null
  flights: FlightOffer[]
  filteredFlights: FlightOffer[]
  onDateSelect: (departureDate: Date, returnDate: Date) => void
}

const COLS = 7
const ROWS = 7

export function DateGrid({ searchParams, flights, filteredFlights, onDateSelect }: DateGridProps) {
  const [colOffset, setColOffset] = useState(0)
  const [rowOffset, setRowOffset] = useState(0)
  const [gridData, setGridData] = useState<DateGridData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!searchParams?.origin || !searchParams?.destination || !searchParams?.departureDate) {
      setGridData(null)
      return
    }

    const fetchGridData = async () => {
      setIsLoading(true)
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const departureDates: string[] = []
        for (let i = 0; i < 14; i++) {
          const date = new Date(today)
          date.setDate(date.getDate() + i)
          departureDates.push(toLocalDateString(date))
        }

        const returnDates: string[] = []
        for (let i = 1; i <= 14; i++) {
          const date = new Date(today)
          date.setDate(date.getDate() + i)
          returnDates.push(toLocalDateString(date))
        }

        const cells = new Map<string, DateGridCell>()
        let lowestPrice = Infinity
        let highestPrice = 0
        let cellsFetched = 0
        const maxCells = 28

        for (const depDate of departureDates.slice(0, COLS + 2)) {
          for (const retDate of returnDates.slice(0, ROWS + 2)) {
            const depDateObj = new Date(depDate)
            const retDateObj = new Date(retDate)
            const cellKey = `${depDate}_${retDate}`
            const duration = Math.ceil((retDateObj.getTime() - depDateObj.getTime()) / (24 * 60 * 60 * 1000))

            if (retDateObj <= depDateObj) {
              cells.set(cellKey, { departureDate: depDate, returnDate: retDate, price: 0, available: false, isLowest: false, isSelected: false, tripDuration: 0 })
              continue
            }

            if (cellsFetched >= maxCells) {
              cells.set(cellKey, { departureDate: depDate, returnDate: retDate, price: 0, available: false, isLowest: false, isSelected: false, tripDuration: duration })
              continue
            }

            try {
              const response = await fetch("/api/flights/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  originLocationCode: searchParams.origin!.iataCode,
                  destinationLocationCode: searchParams.destination!.iataCode,
                  departureDate: depDate,
                  returnDate: retDate,
                  adults: searchParams.passengers.adults,
                  children: searchParams.passengers.children,
                  infants: searchParams.passengers.infants,
                  travelClass: searchParams.cabinClass,
                  max: 1,
                }),
              })
              cellsFetched++

              if (response.ok) {
                const { data } = await response.json()
                if (data?.length > 0) {
                  const price = parseFloat(data[0].price.grandTotal)
                  lowestPrice = Math.min(lowestPrice, price)
                  highestPrice = Math.max(highestPrice, price)
                  const isSelected = depDate === toLocalDateString(searchParams.departureDate!) && retDate === toLocalDateString(searchParams.returnDate!)
                  cells.set(cellKey, { departureDate: depDate, returnDate: retDate, price, available: true, isLowest: false, isSelected, tripDuration: duration })
                } else {
                  cells.set(cellKey, { departureDate: depDate, returnDate: retDate, price: 0, available: false, isLowest: false, isSelected: false, tripDuration: duration })
                }
              } else {
                cells.set(cellKey, { departureDate: depDate, returnDate: retDate, price: 0, available: false, isLowest: false, isSelected: false, tripDuration: duration })
              }
            } catch {
              cells.set(cellKey, { departureDate: depDate, returnDate: retDate, price: 0, available: false, isLowest: false, isSelected: false, tripDuration: duration })
            }

            if (cellsFetched % 4 === 0) await new Promise(r => setTimeout(r, 100))
          }
        }

        cells.forEach(cell => { if (cell.available && cell.price === lowestPrice) cell.isLowest = true })
        setGridData({ departureDates, returnDates, cells, lowestPrice: lowestPrice === Infinity ? 0 : lowestPrice, highestPrice })
      } catch (error) {
        console.error("Error:", error)
        setGridData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGridData()
  }, [searchParams])

  const visibleDepDates = useMemo(() => gridData?.departureDates.slice(colOffset, colOffset + COLS) || [], [gridData, colOffset])
  const visibleRetDates = useMemo(() => gridData?.returnDates.slice(rowOffset, rowOffset + ROWS) || [], [gridData, rowOffset])

  const handleClick = useCallback((cell: DateGridCell) => {
    if (cell.available) onDateSelect(new Date(cell.departureDate + "T00:00:00"), new Date(cell.returnDate + "T00:00:00"))
  }, [onDateSelect])

  const formatHeader = (d: string) => {
    const date = new Date(d + "T00:00:00")
    return { day: date.toLocaleDateString("en-US", { weekday: "short" }), date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) }
  }

  const getPriceColor = (cell: DateGridCell) => {
    if (!cell.available) return ""
    if (cell.isLowest) return "text-emerald-500"
    if (!gridData) return ""
    const ratio = (cell.price - gridData.lowestPrice) / (gridData.highestPrice - gridData.lowestPrice || 1)
    return ratio > 0.7 ? "text-red-400" : ratio < 0.3 ? "text-emerald-400" : ""
  }

  if (!searchParams?.origin || !searchParams?.destination) return null
  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /><span className="ml-2 text-sm text-muted-foreground">Loading prices...</span></div>
  if (!gridData) return null

  return (
    <div className="space-y-2">
      {/* Controls */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <span className="font-medium text-muted-foreground">Departure</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setColOffset(Math.max(0, colOffset - COLS))} disabled={colOffset === 0}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setColOffset(Math.min(gridData.departureDates.length - COLS, colOffset + COLS))} disabled={colOffset + COLS >= gridData.departureDates.length}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-emerald-500" />
          <span>Cheapest</span>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr) 70px` }}>
          {/* Header row */}
          {visibleDepDates.map(d => {
            const { day, date } = formatHeader(d)
            return (
              <div key={d} className="border-b border-r border-border bg-muted/40 py-2 text-center">
                <div className="text-[10px] text-muted-foreground">{day}</div>
                <div className="text-xs font-medium">{date}</div>
              </div>
            )
          })}
          <div className="border-b border-border bg-muted/40 py-2 px-1 text-center flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground">Return</span>
            <div className="flex gap-0.5 mt-0.5">
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setRowOffset(Math.max(0, rowOffset - ROWS))} disabled={rowOffset === 0}><ChevronUp className="h-3 w-3" /></Button>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setRowOffset(Math.min(gridData.returnDates.length - ROWS, rowOffset + ROWS))} disabled={rowOffset + ROWS >= gridData.returnDates.length}><ChevronDown className="h-3 w-3" /></Button>
            </div>
          </div>

          {visibleRetDates.map(retDate => {
            const { day, date } = formatHeader(retDate)
            return (
              <Fragment key={retDate}>
                {visibleDepDates.map(depDate => {
                  const cell = gridData.cells.get(`${depDate}_${retDate}`)
                  const invalid = new Date(retDate) <= new Date(depDate)

                  if (invalid || !cell) {
                    return <div key={`${depDate}_${retDate}`} className="h-11 border-b border-r border-border bg-muted/10 flex items-center justify-center"><span className="text-muted-foreground/30 text-xs">-</span></div>
                  }

                  return (
                    <button
                      key={`${depDate}_${retDate}`}
                      onClick={() => handleClick(cell)}
                      disabled={!cell.available}
                      className={cn(
                        "h-11 border-b border-r border-border flex items-center justify-center relative transition-colors",
                        cell.available ? "hover:bg-accent/50 cursor-pointer" : "cursor-default bg-muted/5",
                        cell.isSelected && "bg-primary/20 ring-1 ring-inset ring-primary"
                      )}
                    >
                      {cell.available ? (
                        <>
                          {cell.isLowest && <Sparkles className="absolute top-0.5 left-0.5 h-2.5 w-2.5 text-emerald-500" />}
                          <span className={cn("text-xs font-medium", getPriceColor(cell))}>{formatPrice(cell.price)}</span>
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">no flights</span>
                      )}
                    </button>
                  )
                })}
                <div key={`ret-${retDate}`} className="h-11 border-b border-border bg-muted/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground leading-tight">{day}</div>
                    <div className="text-[10px] font-medium leading-tight">{date}</div>
                  </div>
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      {searchParams.departureDate && searchParams.returnDate && (
        <div className="text-xs text-muted-foreground">
          {searchParams.departureDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {searchParams.returnDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · Round trip
        </div>
      )}
    </div>
  )
}
