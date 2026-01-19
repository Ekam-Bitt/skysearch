import Link from "next/link"
import { Plane, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
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
                <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
                        <p className="text-muted-foreground">
                            We collect information you provide directly to us, such as when you search for flights, create an account, or contact us for support. This may include your name, email address, and travel preferences.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
                        <p className="text-muted-foreground">
                            We use the information we collect to provide, maintain, and improve our services, process your searches, and communicate with you about products, services, and promotional offers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Information Sharing</h2>
                        <p className="text-muted-foreground">
                            We do not sell your personal information. We may share your information with airline partners to complete bookings and with service providers who assist in our operations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Data Security</h2>
                        <p className="text-muted-foreground">
                            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                        <p className="text-muted-foreground">
                            If you have any questions about this Privacy Policy, please contact us at privacy@skysearch.com.
                        </p>
                    </section>
                </div>

                <p className="mt-12 text-sm text-muted-foreground">Last updated: January 2026</p>
            </main>
        </div>
    )
}
