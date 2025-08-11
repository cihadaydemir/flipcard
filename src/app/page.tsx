import HomeApp from "@/components/home-app"
import { Suspense } from "react"

export default function Home() {
    return (
        <Suspense fallback={null}>
            <HomeApp />
        </Suspense>
    )
}
