"use client"

import AddCardDialog from "@/components/add-card-dialog"
import ModeToggle from "@/components/mode-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import React from "react"

type HomeHeaderProps = {
  allTags: string[]
  selectedTags: string[]
  onToggleTag: (t: string) => void
  onClearTags: () => void
}

export default function HomeHeader({ allTags, selectedTags, onToggleTag, onClearTags }: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/60 backdrop-blur border-b">
      <div className="mx-auto max-w-screen-md px-4 py-3 flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Flipcard</h1>
        <div className="flex items-center gap-2">
          <AddCardDialog />
          <ModeToggle />
        </div>
      </div>
      <div className="mx-auto max-w-screen-md px-4 pb-3">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="single">Single</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
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
                onClick={() => onToggleTag(t)}
              >
                {t}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearTags}>
                Clear
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
