"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when page is scrolled down 400px
            if (window.scrollY > 400) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <Button
            onClick={scrollToTop}
            size="icon"
            className={cn(
                "fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300",
                isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-16 opacity-0 pointer-events-none"
            )}
        >
            <ArrowUp className="h-5 w-5" />
            <span className="sr-only">Scroll to top</span>
        </Button>
    )
}
