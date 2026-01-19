import Link from "next/link"
import { Plane, ArrowLeft, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Plane className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">SkySearch</span>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-12">
                <h1 className="mb-4 text-3xl font-bold">Support</h1>
                <p className="mb-8 text-lg text-muted-foreground">
                    We're here to help! Choose how you'd like to get in touch.
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Email Support</CardTitle>
                            <CardDescription>Get help via email within 24 hours</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <a href="mailto:support@skysearch.com" className="text-primary hover:underline">
                                support@skysearch.com
                            </a>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                                <MessageCircle className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>FAQ</CardTitle>
                            <CardDescription>Find answers to common questions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <details className="group">
                                    <summary className="cursor-pointer font-medium hover:text-primary">How do I search for flights?</summary>
                                    <p className="mt-2 text-muted-foreground">Enter your origin, destination, dates, and passengers, then click Search to find available flights.</p>
                                </details>
                                <details className="group">
                                    <summary className="cursor-pointer font-medium hover:text-primary">Can I filter my results?</summary>
                                    <p className="mt-2 text-muted-foreground">Yes! Use the filters panel to narrow results by stops, price, airlines, departure time, and more.</p>
                                </details>
                                <details className="group">
                                    <summary className="cursor-pointer font-medium hover:text-primary">How do I book a flight?</summary>
                                    <p className="mt-2 text-muted-foreground">Click on any flight result to view details and booking options with the airline.</p>
                                </details>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
