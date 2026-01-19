"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  isRoundTrip?: boolean
  count?: number
}

export function LoadingSkeleton({ isRoundTrip = true, count = 3 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Results Header Skeleton */}
      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48" />
            <div className="mt-2 flex gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Price Graph Skeleton */}
      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="flex items-end justify-between gap-2 h-48 md:h-56">
          {[...Array(11)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton
                className="w-full rounded-t-sm"
                style={{ height: `${Math.random() * 60 + 40}%` }}
              />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Flight Cards Skeleton */}
      {[...Array(count)].map((_, i) => (
        <FlightCardSkeleton key={i} isRoundTrip={isRoundTrip} index={i} />
      ))}
    </div>
  )
}

function FlightCardSkeleton({ isRoundTrip, index }: { isRoundTrip: boolean; index: number }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 md:p-5 animate-pulse",
        // Stagger animation delay for visual interest
        index === 0 && "animation-delay-0",
        index === 1 && "animation-delay-100",
        index === 2 && "animation-delay-200"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Flight Info */}
        <div className="flex-1 space-y-4">
          {/* Outbound Itinerary */}
          <ItinerarySkeleton label={isRoundTrip ? "Outbound" : undefined} />

          {/* Return Itinerary */}
          {isRoundTrip && (
            <>
              <div className="border-t border-dashed border-border" />
              <ItinerarySkeleton label="Return" />
            </>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="text-right space-y-1">
            <Skeleton className="h-8 w-24 ml-auto" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
          <Skeleton className="h-10 w-20 rounded-md" />
        </div>
      </div>

      {/* Airline & Details Toggle */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-8 w-28 rounded" />
      </div>
    </div>
  )
}

function ItinerarySkeleton({ label }: { label?: string }) {
  return (
    <div className="space-y-2">
      {label && <Skeleton className="h-3 w-16" />}
      <div className="flex items-center gap-4">
        {/* Departure */}
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-14 mx-auto" />
          <Skeleton className="h-4 w-10 mx-auto" />
        </div>

        {/* Flight Path */}
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full items-center gap-1">
            <Skeleton className="h-0.5 flex-1" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-0.5 flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Arrival */}
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-14 mx-auto" />
          <Skeleton className="h-4 w-10 mx-auto" />
        </div>
      </div>
    </div>
  )
}
