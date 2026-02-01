const CACHE_NAME = 'cockpit-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET and API/WebSocket requests
  if (request.method !== 'GET') return
  if (request.url.includes('/api/')) return
  if (request.url.includes('/ws/')) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful HTML and static asset responses
        if (response.ok && (request.destination === 'document' || request.destination === 'script' || request.destination === 'style')) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        // Serve from cache when offline
        return caches.match(request).then((cached) => cached || new Response('Offline', { status: 503 }))
      })
  )
})
