"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-4 w-4" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    const isDark = resolvedTheme === "dark"

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {isDark ? (
                <Sun className="h-4 w-4 transition-transform" />
            ) : (
                <Moon className="h-4 w-4 transition-transform" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
