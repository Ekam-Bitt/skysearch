import Link from "next/link"
import { Plane, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
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
                <h1 className="mb-8 text-3xl font-bold">Terms of Service</h1>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
                        <p className="text-muted-foreground">
                            By accessing and using SkySearch, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Service Description</h2>
                        <p className="text-muted-foreground">
                            SkySearch is a flight search and comparison platform. We aggregate flight information from various airlines and travel providers to help you find the best options for your travel needs.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">User Responsibilities</h2>
                        <p className="text-muted-foreground">
                            You agree to use our service for lawful purposes only. You are responsible for ensuring the accuracy of the information you provide and for compliance with all applicable travel requirements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
                        <p className="text-muted-foreground">
                            SkySearch acts as an intermediary and does not operate flights. We are not liable for changes, cancellations, or issues with flights booked through airline partners.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
                        <p className="text-muted-foreground">
                            We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
                        </p>
                    </section>
                </div>

                <p className="mt-12 text-sm text-muted-foreground">Last updated: January 2026</p>
            </main>
        </div>
    )
}
