"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  addCard,
  deleteCard,
  getAllTags,
  getCards,
  updateCardTags,
  type CardRecord,
} from "@/lib/db"

export const queryKeys = {
  cards: ["cards"] as const,
  allTags: ["allTags"] as const,
}

export function useCardsQuery() {
  return useQuery<CardRecord[], Error>({
    queryKey: queryKeys.cards,
    queryFn: getCards,
    select: (cards) => cards.slice().sort((a, b) => b.createdAt - a.createdAt),
    // IndexedDB is local and fast; keep data fresh but avoid refetch spam
    refetchOnWindowFocus: false,
  })
}

export function useAllTagsQuery(options?: { enabled?: boolean }) {
  return useQuery<string[], Error>({
    queryKey: queryKeys.allTags,
    queryFn: getAllTags,
    enabled: options?.enabled,
    refetchOnWindowFocus: false,
  })
}

export function useAddCardMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addCard,
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.cards }),
        qc.invalidateQueries({ queryKey: queryKeys.allTags }),
      ])
    },
  })
}

export function useDeleteCardMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCard(id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.cards }),
        qc.invalidateQueries({ queryKey: queryKeys.allTags }),
      ])
    },
  })
}

export function useUpdateCardTagsMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) =>
      updateCardTags(id, tags),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.cards }),
        qc.invalidateQueries({ queryKey: queryKeys.allTags }),
      ])
    },
  })
}
