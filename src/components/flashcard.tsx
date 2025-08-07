"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"
import { updateCardTags } from "@/lib/db"

export default function Flashcard({
  id,
  front,
  back,
  tags,
  onDelete,
  onTagsUpdated,
}: {
  id?: string
  front: Blob
  back: Blob
  tags?: string[]
  onDelete?: () => void
  onTagsUpdated?: (tags: string[]) => void
}) {
  const [flipped, setFlipped] = useState(false)
  const [urls, setUrls] = useState<{ a: string; b: string }>({ a: "", b: "" })
  const [editOpen, setEditOpen] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [localTags, setLocalTags] = useState<string[]>(tags ?? [])

  useEffect(() => {
    const a = URL.createObjectURL(front)
    const b = URL.createObjectURL(back)
    setUrls({ a, b })
    return () => {
      URL.revokeObjectURL(a)
      URL.revokeObjectURL(b)
    }
  }, [front, back])

  useEffect(() => {
    setLocalTags(tags ?? [])
  }, [tags])

  function addTagFromInput() {
    const t = tagInput.trim()
    if (t && !localTags.includes(t)) setLocalTags([...localTags, t])
    setTagInput("")
  }

  function removeTag(t: string) {
    setLocalTags((prev) => prev.filter((x) => x !== t))
  }

  async function saveTags() {
    if (!id) return setEditOpen(false)
    await updateCardTags(id, localTags)
    onTagsUpdated?.(localTags)
    setEditOpen(false)
  }

  return (
    <div
      className="relative w-full max-w-sm aspect-[3/2] select-none"
      onClick={() => setFlipped((f) => !f)}
    >
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        {id && (
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button
                className=""
                size="icon"
                variant="secondary"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                }}
                aria-label="Edit tags"
                title="Edit tags"
              >
                <Pencil className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit tags</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
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
                  {localTags.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(t)}
                    >
                      {t} ×
                    </Badge>
                  ))}
                  {localTags.length === 0 && (
                    <span className="text-sm text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={saveTags}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {onDelete && (
          <Button
            className=""
            size="icon"
            variant="secondary"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              onDelete()
            }}
            aria-label="Delete card"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
      <div className="h-full w-full [perspective:1000px]">
        <div
          className={
            "relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]" +
            (flipped ? " [transform:rotateY(180deg)]" : "")
          }
        >
          <Card className="absolute inset-0 overflow-hidden [backface-visibility:hidden]">
            {urls.a && (
              <img src={urls.a} alt="Side A" className="size-full object-contain" />
            )}
          </Card>
          <Card className="absolute inset-0 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {urls.b && (
              <img src={urls.b} alt="Side B" className="size-full object-contain" />
            )}
          </Card>
        </div>
      </div>
      {tags && tags.length > 0 && (
        <div className="absolute bottom-2 left-2 right-2 z-10 flex flex-wrap gap-1 pointer-events-none">
          {tags.map((t) => (
            <span
              key={t}
              className="text-xs bg-background/70 border px-1.5 py-0.5 rounded"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
