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
  const db = await getDB()
  await db.put(STORE_CARDS, record)
}

export async function getCards(): Promise<CardRecord[]> {
  const db = await getDB()
  return db.getAll(STORE_CARDS)
}

export async function deleteCard(id: string) {
  const db = await getDB()
  await db.delete(STORE_CARDS, id)
}

export async function updateCardTags(id: string, tags: string[]) {
  const db = await getDB()
  const rec = (await db.get(STORE_CARDS, id)) as CardRecord | undefined
  if (!rec) return
  rec.tags = tags
  rec.updatedAt = Date.now()
  await db.put(STORE_CARDS, rec)
}

export async function getAllTags(): Promise<string[]> {
  const cards = await getCards()
  const set = new Set<string>()
  for (const c of cards) {
    for (const t of c.tags || []) set.add(t)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export function createCard({
  sideA,
  sideB,
  tags = [],
}: {
  sideA: Blob
  sideB: Blob
  tags?: string[]
}): CardRecord {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    tags,
    sideA,
    sideB,
  }
}
