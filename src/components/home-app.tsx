"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import Flashcard from "@/components/flashcard"
import AddCardDialog from "@/components/add-card-dialog"
import ModeToggle from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react"
import { useAllTagsQuery, useCardsQuery, useDeleteCardMutation } from "@/lib/queries"

export default function HomeApp() {
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [shuffle, setShuffle] = useState(false)
	const { data: cards = [] } = useCardsQuery()
	const { data: allTags = [] } = useAllTagsQuery()
	const deleteMutation = useDeleteCardMutation()
	const searchParams = useSearchParams()
	const viewParam = searchParams.get("view")
	const isSingle = viewParam === "single"
	const [currentIndex, setCurrentIndex] = useState(0)

	// Base filtered list (no shuffle)
	const baseFiltered = useMemo(() => {
		let arr = cards
		if (selectedTags.length) {
			arr = arr.filter((c) => c.tags?.some((t) => selectedTags.includes(t)))
		}
		return arr
	}, [cards, selectedTags])

	// Single view list (optionally shuffled)
	const singleList = useMemo(() => {
		if (!shuffle) return baseFiltered
		const arr = [...baseFiltered]
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[arr[i], arr[j]] = [arr[j], arr[i]]
		}
		return arr
	}, [baseFiltered, shuffle])

	// Keep current index in range when list changes
	useEffect(() => {
		setCurrentIndex((i) => (singleList.length === 0 ? 0 : Math.min(i, singleList.length - 1)))
	}, [singleList.length])

	function toggleTag(t: string) {
		setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
	}

	return (
		<div className="min-h-dvh flex flex-col overflow-hidden">
			<header className="sticky top-0 z-10 bg-background/60 backdrop-blur border-b">
				<div className="mx-auto max-w-screen-md px-4 py-3 flex items-center justify-between gap-2">
					<h1 className="text-lg font-semibold">Flipcard</h1>
					<div className="flex items-center gap-2">
						<AddCardDialog />
						<ModeToggle />
					</div>
				</div>
				{/* Tabs */}
				<div className="mx-auto max-w-screen-md px-4 pb-3">
					<div className="flex justify-center">
						<div className="inline-grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
								<Link
								href={{ pathname: "/", query: { view: "single" } }}
								className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
									isSingle ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
								}`}
								aria-current={isSingle ? "page" : undefined}
							>
								Single
							</Link>
							<Link
								href={{ pathname: "/", query: { view: "overview" } }}
								className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
									!isSingle ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
								}`}
								aria-current={!isSingle ? "page" : undefined}
							>
								Overview
							</Link>
						</div>
					</div>
				</div>
				{allTags.length > 0 && (
					<div className="mx-auto max-w-screen-md px-4 pb-3">
						<div className="flex flex-wrap gap-2">
							{allTags.map((t) => (
								<Badge
									key={t}
									variant={selectedTags.includes(t) ? "default" : "secondary"}
									className="cursor-pointer"
									onClick={() => toggleTag(t)}
								>
									{t}
								</Badge>
							))}
							{selectedTags.length > 0 && (
								<Button variant="ghost" size="sm" onClick={() => setSelectedTags([])}>
									Clear
								</Button>
							)}
						</div>
					</div>
				)}
			</header>
			<main className={`mx-auto ${isSingle ? "max-w-screen-md" : "max-w-screen-2xl"} w-full p-4`}>
				{isSingle ? (
					<div className="flex flex-col items-center gap-4">
						{singleList.length === 0 ? (
							<div className="text-center text-sm text-muted-foreground py-20">
								No cards yet. Tap &quot;Add Card&quot; to create your first one.
							</div>
						) : (
							<>
								<Flashcard
									key={singleList[currentIndex].id}
									id={singleList[currentIndex].id}
									front={singleList[currentIndex].sideA}
									back={singleList[currentIndex].sideB}
									tags={singleList[currentIndex].tags}
									onDelete={async () => {
										await deleteMutation.mutateAsync(singleList[currentIndex].id)
									}}
								/>
								<div className="flex items-center gap-2">
									<Button
										variant="secondary"
										size="sm"
										onClick={() =>
											setCurrentIndex((i) => (singleList.length ? (i - 1 + singleList.length) % singleList.length : 0))
										}
										aria-label="Previous card"
									>
										<ChevronLeft className="mr-2 size-4" /> Previous
									</Button>
									<Button
										variant={shuffle ? "default" : "secondary"}
										size="sm"
										onClick={() => setShuffle((s) => !s)}
										aria-pressed={shuffle}
										aria-label="Toggle shuffle"
									>
										<Shuffle className="mr-2 size-4" /> {shuffle ? "Shuffling" : "Shuffle"}
									</Button>
									<Button
										variant="secondary"
										size="sm"
										onClick={() =>
											setCurrentIndex((i) => (singleList.length ? (i + 1) % singleList.length : 0))
										}
										aria-label="Next card"
									>
										Next <ChevronRight className="ml-2 size-4" />
									</Button>
								</div>
								<div className="text-xs text-muted-foreground">{currentIndex + 1} / {singleList.length}</div>
							</>
						)}
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{baseFiltered.length === 0 ? (
							<div className="col-span-full text-center text-sm text-muted-foreground py-20">
								No cards yet. Tap &quot;Add Card&quot; to create your first one.
							</div>
						) : (
							baseFiltered.map((c) => (
								<Flashcard
									key={c.id}
									id={c.id}
									front={c.sideA}
									back={c.sideB}
									tags={c.tags}
									onDelete={async () => {
										await deleteMutation.mutateAsync(c.id)
									}}
								/>
							))
						)}
					</div>
				)}
			</main>
		</div>
	)
}
