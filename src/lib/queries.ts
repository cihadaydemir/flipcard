"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addCard, deleteCard, getAllTags, getCards, updateCardTags, type CardRecord } from "@/lib/db"

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
		// Optimistic update so UI reflects new card immediately
		onMutate: async (newRec: CardRecord) => {
			await Promise.all([
				qc.cancelQueries({ queryKey: queryKeys.cards }),
				qc.cancelQueries({ queryKey: queryKeys.allTags }),
			])
			const prevCards = qc.getQueryData<CardRecord[]>(queryKeys.cards)
			const prevAllTags = qc.getQueryData<string[]>(queryKeys.allTags)

			if (prevCards) {
				qc.setQueryData<CardRecord[]>(queryKeys.cards, [newRec, ...prevCards])
			} else {
				qc.setQueryData<CardRecord[]>(queryKeys.cards, [newRec])
			}

			if (prevAllTags) {
				const set = new Set(prevAllTags)
				for (const t of newRec.tags || []) set.add(t)
				qc.setQueryData<string[]>(queryKeys.allTags, Array.from(set).sort((a, b) => a.localeCompare(b)))
			}

			return { prevCards, prevAllTags }
		},
		onError: (_err, _newRec, ctx) => {
			if (ctx?.prevCards !== undefined) qc.setQueryData(queryKeys.cards, ctx.prevCards)
			if (ctx?.prevAllTags !== undefined) qc.setQueryData(queryKeys.allTags, ctx.prevAllTags)
		},
		onSettled: async () => {
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
		mutationFn: ({ id, tags }: { id: string; tags: string[] }) => updateCardTags(id, tags),
		onMutate: async ({ id, tags }) => {
			await Promise.all([
				qc.cancelQueries({ queryKey: queryKeys.cards }),
				qc.cancelQueries({ queryKey: queryKeys.allTags }),
			])
			const prevCards = qc.getQueryData<CardRecord[]>(queryKeys.cards)
			const prevAllTags = qc.getQueryData<string[]>(queryKeys.allTags)

			if (prevCards) {
				const next = prevCards.map((c) => (c.id === id ? { ...c, tags } : c))
				qc.setQueryData<CardRecord[]>(queryKeys.cards, next)
			}

			if (prevAllTags) {
				const set = new Set(prevAllTags)
				for (const t of tags || []) set.add(t)
				qc.setQueryData<string[]>(queryKeys.allTags, Array.from(set).sort((a, b) => a.localeCompare(b)))
			}

			return { prevCards, prevAllTags }
		},
		onError: (_err, _vars, ctx) => {
			if (ctx?.prevCards !== undefined) qc.setQueryData(queryKeys.cards, ctx.prevCards)
			if (ctx?.prevAllTags !== undefined) qc.setQueryData(queryKeys.allTags, ctx.prevAllTags)
		},
		onSettled: async () => {
			await Promise.all([
				qc.invalidateQueries({ queryKey: queryKeys.cards }),
				qc.invalidateQueries({ queryKey: queryKeys.allTags }),
			])
		},
	})
}
