import { openDB, type IDBPDatabase } from "idb"

export type CardRecord = {
	id: string
	createdAt: number
	updatedAt: number
	tags: string[]
	sideA: Blob // native language side
	sideB: Blob // foreign language side
}

const DB_NAME = "flipcard-db"
const DB_VERSION = 1
const STORE_CARDS = "cards"

let dbPromise: Promise<IDBPDatabase> | null = null
let useMemory = false
const memoryStore = new Map<string, CardRecord>()
const IS_E2E = process.env.NEXT_PUBLIC_E2E === "1"

function getDB() {
	if (!dbPromise) {
		dbPromise = openDB(DB_NAME, DB_VERSION, {
			upgrade(db) {
				if (!db.objectStoreNames.contains(STORE_CARDS)) {
					const store = db.createObjectStore(STORE_CARDS, { keyPath: "id" })
					store.createIndex("createdAt", "createdAt")
					store.createIndex("updatedAt", "updatedAt")
					store.createIndex("tags", "tags", { multiEntry: true })
				}
			},
		})
	}
	return dbPromise as Promise<IDBPDatabase>
}

export async function addCard(record: CardRecord) {
    if (useMemory) {
        memoryStore.set(record.id, record)
        return
    }
    try {
        const db = await getDB()
        await db.put(STORE_CARDS, record)
    } catch (e) {
        // Enable fallback only during E2E to avoid affecting real persistence
        if (IS_E2E) {
            if (!useMemory) console.warn("IDB error, switching to in-memory store:", e)
            useMemory = true
            memoryStore.set(record.id, record)
        } else {
            throw e
        }
    }
}

export async function getCards(): Promise<CardRecord[]> {
    if (useMemory) return Array.from(memoryStore.values())
    try {
        const db = await getDB()
        return db.getAll(STORE_CARDS)
    } catch (e) {
        if (IS_E2E) {
            if (!useMemory) console.warn("IDB error, switching to in-memory store:", e)
            useMemory = true
            return Array.from(memoryStore.values())
        } else {
            throw e
        }
    }
}

export async function deleteCard(id: string) {
    if (useMemory) {
        memoryStore.delete(id)
        return
    }
    try {
        const db = await getDB()
        await db.delete(STORE_CARDS, id)
    } catch (e) {
        if (IS_E2E) {
            if (!useMemory) console.warn("IDB error, switching to in-memory store:", e)
            useMemory = true
            memoryStore.delete(id)
        } else {
            throw e
        }
    }
}

export async function updateCardTags(id: string, tags: string[]) {
    if (useMemory) {
        const rec = memoryStore.get(id)
        if (!rec) return
        rec.tags = tags
        rec.updatedAt = Date.now()
        memoryStore.set(id, rec)
        return
    }
    try {
        const db = await getDB()
        const rec = (await db.get(STORE_CARDS, id)) as CardRecord | undefined
        if (!rec) return
        rec.tags = tags
        rec.updatedAt = Date.now()
        await db.put(STORE_CARDS, rec)
    } catch (e) {
        if (IS_E2E) {
            if (!useMemory) console.warn("IDB error, switching to in-memory store:", e)
            useMemory = true
            const rec = memoryStore.get(id)
            if (!rec) return
            rec.tags = tags
            rec.updatedAt = Date.now()
            memoryStore.set(id, rec)
        } else {
            throw e
        }
    }
}

export async function getAllTags(): Promise<string[]> {
	const cards = await getCards()
	const set = new Set<string>()
	for (const c of cards) {
		for (const t of c.tags || []) set.add(t)
	}
	return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export function createCard({ sideA, sideB, tags = [] }: { sideA: Blob; sideB: Blob; tags?: string[] }): CardRecord {
  const now = Date.now()
  const id = (globalThis as any)?.crypto?.randomUUID
    ? (globalThis as any).crypto.randomUUID()
    : `${now}-${Math.random().toString(36).slice(2, 10)}`
  return {
    id,
    createdAt: now,
    updatedAt: now,
    tags,
    sideA,
    sideB,
  }
}
