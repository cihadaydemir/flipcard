const CACHE = "flipcard-cache-v1"

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
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  const url = new URL(req.url)
  if (req.method !== "GET" || url.origin !== self.location.origin) return
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req)
        .then((resp) => {
          const copy = resp.clone()
          caches.open(CACHE).then((cache) => cache.put(req, copy))
          return resp
        })
        .catch(() => caches.match("/"))
    })
  )
})
