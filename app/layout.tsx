import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "SkySearch - Find the Best Flight Deals",
    template: "%s | SkySearch",
  },
  description:
    "Search and compare flights from hundreds of airlines. Find the best prices with our intuitive flight search engine.",
  keywords: ["flights", "travel", "search", "airline", "tickets", "cheap flights"],
  authors: [{ name: "SkySearch Team" }],
  creator: "SkySearch",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://skysearch.vercel.app",
    title: "SkySearch - Find the Best Flight Deals",
    description: "Search and compare flights from hundreds of airlines. Find the best prices with our intuitive flight search engine.",
    siteName: "SkySearch",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkySearch - Find the Best Flight Deals",
    description: "Search and compare flights from hundreds of airlines. Find the best prices with our intuitive flight search engine.",
    creator: "@skysearch",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics debug={false} />
        <SpeedInsights debug={false} />
      </body>
    </html>
  )
}

