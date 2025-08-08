const CACHE = "flipcard-cache-v2"

self.addEventListener("install", (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(["/"]))
      .catch(() => {})
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  const url = new URL(req.url)
  if (req.method !== "GET" || url.origin !== self.location.origin) return

  const isNavigation = req.mode === "navigate"
  const pathname = url.pathname
  const isIconRequest =
    pathname.includes("apple-touch-icon") ||
    pathname.endsWith(".ico") ||
    pathname.startsWith("/ios/") ||
    pathname.startsWith("/android/") ||
    pathname.includes("favicon")

  // For icons and favicons, avoid HTML fallbacks. Prefer network, fallback to cache only.
  if (isIconRequest || req.destination === "image") {
    event.respondWith(
      fetch(req)
        .then((resp) => resp)
        .catch(() => caches.match(req))
    )
    return
  }

  // For other GET requests: cache-first with network fallback; only fall back to '/' for navigations.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req)
        .then((resp) => {
          const copy = resp.clone()
          caches.open(CACHE).then((cache) => cache.put(req, copy))
          return resp
        })
        .catch(() => (isNavigation ? caches.match("/") : undefined))
    })
  )
})
