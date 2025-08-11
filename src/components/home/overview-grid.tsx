"use client"

import React from "react"
import Flashcard from "@/components/flashcard"
import type { CardRecord } from "@/lib/db"

type OverviewGridProps = {
  list: CardRecord[]
  onDelete: (id: string) => Promise<void>
}

export default function OverviewGrid({ list, onDelete }: OverviewGridProps) {
  return (
    <div className="mx-auto max-w-screen-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.length === 0 ? (
          <div className="col-span-full text-center text-sm text-muted-foreground py-20">
            No cards yet. Tap &quot;Add Card&quot; to create your first one.
          </div>
        ) : (
          list.map((c) => (
            <Flashcard
              key={c.id}
              id={c.id}
              front={c.sideA}
              back={c.sideB}
              tags={c.tags}
              onDelete={async () => {
                await onDelete(c.id)
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
