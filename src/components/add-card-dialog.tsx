"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { createCard } from "@/lib/db"
import { useAddCardMutation, useAllTagsQuery } from "@/lib/queries"
import { compressImage } from "@/lib/image"
import Image from "next/image"

export default function AddCardDialog() {
	const [open, setOpen] = useState(false)
	const [fileA, setFileA] = useState<File | null>(null)
	const [fileB, setFileB] = useState<File | null>(null)
	const [tagInput, setTagInput] = useState("")
	const [tags, setTags] = useState<string[]>([])
	const [previewA, setPreviewA] = useState<string>("")
	const [previewB, setPreviewB] = useState<string>("")
	const [showSuggestions, setShowSuggestions] = useState(false)
	const { data: allTags = [] } = useAllTagsQuery({ enabled: open })
	const addMutation = useAddCardMutation()

	useEffect(() => {
		if (fileA) {
			const url = URL.createObjectURL(fileA)
			setPreviewA(url)
			return () => URL.revokeObjectURL(url)
		} else setPreviewA("")
	}, [fileA])

	useEffect(() => {
		if (fileB) {
			const url = URL.createObjectURL(fileB)
			setPreviewB(url)
			return () => URL.revokeObjectURL(url)
		} else setPreviewB("")
	}, [fileB])

	// Tags are fetched via useAllTagsQuery only when dialog is open

	function addTagFromInput() {
		const t = tagInput.trim()
		if (t && !tags.includes(t)) setTags([...tags, t])
		setTagInput("")
		setShowSuggestions(false)
	}

	function selectSuggestedTag(t: string) {
		if (!tags.includes(t)) setTags([...tags, t])
		setTagInput("")
		setShowSuggestions(false)
	}

	function removeTag(t: string) {
		setTags(tags.filter((x) => x !== t))
	}

	async function onSave() {
		if (!fileA || !fileB) return
		const [blobA, blobB] = await Promise.all([compressImage(fileA), compressImage(fileB)])
		const rec = createCard({ sideA: blobA, sideB: blobB, tags })
		await addMutation.mutateAsync(rec)
		setOpen(false)
		setFileA(null)
		setFileB(null)
		setTags([])
		setTagInput("")
		setShowSuggestions(false)
	}

	const filteredSuggestions = allTags
		.filter((t) => (tagInput ? t.toLowerCase().includes(tagInput.toLowerCase()) : true))
		.filter((t) => !tags.includes(t))
		.slice(0, 8)

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				setOpen(v)
				if (!v) {
					// reset suggestion UI on close
					setShowSuggestions(false)
					setTagInput("")
				}
			}}
		>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 size-4" /> Add Card
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add a new card</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="sideA">Side A (Language A)</Label>
						<Input
							id="sideA"
							type="file"
							accept="image/*"
							capture="environment"
							onChange={(e) => setFileA(e.target.files?.[0] ?? null)}
						/>
						{previewA && (
							<Image
								src={previewA}
								alt="Preview A"
								width={800}
								height={600}
								className="w-full rounded border object-contain"
								unoptimized
								priority={false}
							/>
						)}
					</div>
					<div className="grid gap-2">
						<Label htmlFor="sideB">Side B (Language B)</Label>
						<Input
							id="sideB"
							type="file"
							accept="image/*"
							capture="environment"
							onChange={(e) => setFileB(e.target.files?.[0] ?? null)}
						/>
						{previewB && (
							<Image
								src={previewB}
								alt="Preview B"
								width={800}
								height={600}
								className="w-full rounded border object-contain"
								unoptimized
								priority={false}
							/>
						)}
					</div>
					<div className="grid gap-2">
						<Label htmlFor="tags">Tags</Label>
						<div className="relative">
							<div className="flex gap-2">
								<Input
									id="tags"
									placeholder="e.g. Arabic, Conversation"
									value={tagInput}
									onChange={(e) => {
										setTagInput(e.target.value)
										setShowSuggestions(true)
									}}
									onFocus={() => setShowSuggestions(true)}
									onBlur={() => {
										// Delay to allow click on suggestion
										setTimeout(() => setShowSuggestions(false), 120)
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault()
											addTagFromInput()
										}
									}}
								/>
								<Button type="button" variant="secondary" onClick={addTagFromInput}>
									Add
								</Button>
							</div>
							{showSuggestions && filteredSuggestions.length > 0 && (
								<div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow">
									<ul className="max-h-48 overflow-auto py-1 text-sm">
										{filteredSuggestions.map((t) => (
											<li key={t}>
												<button
													type="button"
													className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
													onMouseDown={(e) => e.preventDefault()}
													onClick={() => selectSuggestedTag(t)}
												>
													{t}
												</button>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
						<div className="flex flex-wrap gap-2">
							{tags.map((t) => (
								<Badge
									key={t}
									variant="secondary"
									className="cursor-pointer"
									onClick={() => removeTag(t)}
								>
									{t} ×
								</Badge>
							))}
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button onClick={onSave} disabled={!fileA || !fileB || addMutation.isPending}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
