"use client"

import { useMemo, useState } from "react"
import Flashcard from "@/components/flashcard"
import AddCardDialog from "@/components/add-card-dialog"
import ModeToggle from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shuffle } from "lucide-react"
import { useAllTagsQuery, useCardsQuery, useDeleteCardMutation } from "@/lib/queries"

export default function HomeApp() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [shuffle, setShuffle] = useState(false)
  const { data: cards = [] } = useCardsQuery()
  const { data: allTags = [] } = useAllTagsQuery()
  const deleteMutation = useDeleteCardMutation()

  const filtered = useMemo(() => {
    let arr = cards
    if (selectedTags.length) {
      arr = arr.filter((c) => c.tags?.some((t) => selectedTags.includes(t)))
    }
    if (shuffle) {
      arr = [...arr]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
    }
    return arr
  }, [cards, selectedTags, shuffle])

  function toggleTag(t: string) {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 bg-background/60 backdrop-blur border-b">
        <div className="mx-auto max-w-screen-md px-4 py-3 flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">Flipcard</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={shuffle ? "default" : "secondary"}
              size="sm"
              onClick={() => setShuffle((s) => !s)}
              aria-pressed={shuffle}
            >
              <Shuffle className="mr-2 size-4" /> {shuffle ? "Shuffling" : "Shuffle"}
            </Button>
            <AddCardDialog />
            <ModeToggle />
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
      <main className="mx-auto max-w-screen-md w-full p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-sm text-muted-foreground py-20">
            No cards yet. Tap &quot;Add Card&quot; to create your first one.
          </div>
        ) : (
          filtered.map((c) => (
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
      </main>
    </div>
  )
}
