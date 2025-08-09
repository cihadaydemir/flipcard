import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	/* config options here */
	async rewrites() {
		return [{ source: "/apple-touch-icon.png", destination: "/apple-touch-icon-precomposed.png" }]
	},
}

export default nextConfig
