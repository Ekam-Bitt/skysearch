"use client"

import Image from "next/image"
import { useState } from "react"

interface AirlineLogoProps {
    code: string
    name?: string
    size?: "sm" | "md" | "lg"
    className?: string
}

// Use the Airline Logos API CDN
// Alternative CDNs available as fallback
const getLogoUrl = (code: string) => {
    // Primary: pics.avs.io (commonly used for airline logos)
    return `https://pics.avs.io/60/60/${code}.png`
}

const SIZES = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 },
}

export function AirlineLogo({ code, name, size = "md", className = "" }: AirlineLogoProps) {
    const [hasError, setHasError] = useState(false)
    const { width, height } = SIZES[size]

    if (hasError) {
        // Fallback to text code with styled background
        return (
            <div
                className={`flex items-center justify-center rounded bg-secondary text-xs font-bold text-secondary-foreground ${className}`}
                style={{ width, height }}
                title={name || code}
            >
                {code}
            </div>
        )
    }

    return (
        <div
            className={`relative flex items-center justify-center overflow-hidden rounded ${className}`}
            style={{ width, height }}
        >
            <Image
                src={getLogoUrl(code)}
                alt={name || code}
                width={width}
                height={height}
                className="object-contain"
                onError={() => setHasError(true)}
                unoptimized // Use unoptimized since it's an external CDN
            />
        </div>
    )
}
