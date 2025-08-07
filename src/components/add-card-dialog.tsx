"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { addCard, createCard } from "@/lib/db"
import { compressImage } from "@/lib/image"
import Image from "next/image"

export default function AddCardDialog({ onAdded }: { onAdded?: () => void }) {
  const [open, setOpen] = useState(false)
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [previewA, setPreviewA] = useState<string>("")
  const [previewB, setPreviewB] = useState<string>("")

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

  function addTagFromInput() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput("")
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t))
  }

  async function onSave() {
    if (!fileA || !fileB) return
    const [blobA, blobB] = await Promise.all([
      compressImage(fileA),
      compressImage(fileB),
    ])
    const rec = createCard({ sideA: blobA, sideB: blobB, tags })
    await addCard(rec)
    setOpen(false)
    setFileA(null)
    setFileB(null)
    setTags([])
    setTagInput("")
    onAdded?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="e.g. Arabic, Conversation"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
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
          <Button onClick={onSave} disabled={!fileA || !fileB}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
