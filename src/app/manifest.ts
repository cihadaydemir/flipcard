import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flipcard",
    short_name: "Flipcard",
    description: "Offline flashcards from your photos",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/next.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/vercel.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  }
}
