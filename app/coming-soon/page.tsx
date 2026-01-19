import Link from "next/link"
import { Plane, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ComingSoonPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                    <Clock className="h-10 w-10 text-primary" />
                </div>
                <h1 className="mb-3 text-4xl font-bold">Coming Soon</h1>
                <p className="mb-8 max-w-md text-lg text-muted-foreground">
                    We're working hard to bring you this feature. Stay tuned for updates!
                </p>
                <Link href="/">
                    <Button size="lg" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Flight Search
                    </Button>
                </Link>
            </div>

            <footer className="absolute bottom-8 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                    <Plane className="h-3 w-3" />
                </div>
                <span>SkySearch</span>
            </footer>
        </div>
    )
}
