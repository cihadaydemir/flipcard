"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = React.useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
					},
				},
			}),
	)
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<QueryClientProvider client={queryClient}>
				{children}
				{process.env.NODE_ENV === "development" ? (
					<ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
				) : null}
			</QueryClientProvider>
		</ThemeProvider>
	)
}
