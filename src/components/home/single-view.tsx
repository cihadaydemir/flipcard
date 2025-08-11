"use client"

import React, { useEffect, useMemo, useState } from "react"
import Flashcard from "@/components/flashcard"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react"
import type { CardRecord } from "@/lib/db"

type SingleViewProps = {
  baseList: CardRecord[]
  onDelete: (id: string) => Promise<void>
}

export default function SingleView({ baseList, onDelete }: SingleViewProps) {
  const [shuffle, setShuffle] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const list = useMemo(() => {
    if (!shuffle) return baseList
    const arr = [...baseList]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [baseList, shuffle])

  useEffect(() => {
    setCurrentIndex((i) => (list.length === 0 ? 0 : Math.min(i, list.length - 1)))
  }, [list.length])

  return (
    <div className="mx-auto max-w-screen-md">
      <div className="flex flex-col items-center gap-4">
        {list.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-20">
            No cards yet. Tap &quot;Add Card&quot; to create your first one.
          </div>
        ) : (
          <>
            <Flashcard
              key={list[currentIndex].id}
              id={list[currentIndex].id}
              front={list[currentIndex].sideA}
              back={list[currentIndex].sideB}
              tags={list[currentIndex].tags}
              onDelete={async () => {
                await onDelete(list[currentIndex].id)
              }}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setCurrentIndex((i) => (list.length ? (i - 1 + list.length) % list.length : 0))
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
                  setCurrentIndex((i) => (list.length ? (i + 1) % list.length : 0))
                }
                aria-label="Next card"
              >
                Next <ChevronRight className="ml-2 size-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">{currentIndex + 1} / {list.length}</div>
          </>
        )}
      </div>
    </div>
  )
}
