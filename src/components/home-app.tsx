"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useAllTagsQuery, useCardsQuery, useDeleteCardMutation } from "@/lib/queries"
import HomeHeader from "@/components/home/header"
import SingleView from "@/components/home/single-view"
import OverviewGrid from "@/components/home/overview-grid"

export default function HomeApp() {
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const { data: cards = [] } = useCardsQuery()
	const { data: allTags = [] } = useAllTagsQuery()
	const deleteMutation = useDeleteCardMutation()
	const searchParams = useSearchParams()
	const router = useRouter()
	const viewParam = searchParams.get("view")
	const isSingle = viewParam === "single"

	// Base filtered list (no shuffle)
	const baseFiltered = useMemo(() => {
		let arr = cards
		if (selectedTags.length) {
			arr = arr.filter((c) => c.tags?.some((t) => selectedTags.includes(t)))
		}
		return arr
	}, [cards, selectedTags])

	function toggleTag(t: string) {
		setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
	}

	return (
		<div className="min-h-dvh flex flex-col overflow-hidden">
			<Tabs
				value={isSingle ? "single" : "overview"}
				onValueChange={(v: string) =>
					router.replace(v === "single" ? "/?view=single" : "/?view=overview")
				}
			>
				<HomeHeader
					allTags={allTags}
					selectedTags={selectedTags}
					onToggleTag={toggleTag}
					onClearTags={() => setSelectedTags([])}
				/>
				<main className="mx-auto w-full p-4">
					<TabsContent value="single">
						<SingleView
							baseList={baseFiltered}
							onDelete={(id) => deleteMutation.mutateAsync(id)}
						/>
					</TabsContent>
					<TabsContent value="overview">
						<OverviewGrid
							list={baseFiltered}
							onDelete={(id) => deleteMutation.mutateAsync(id)}
						/>
					</TabsContent>
				</main>
			</Tabs>
		</div>
	)
}
