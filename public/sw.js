/**
 * PlacementFlow Service Worker
 * Handles caching strategies for offline support.
 * Registered manually via /src/components/ServiceWorkerRegistrar.js
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE  = `pf-static-${CACHE_VERSION}`;
const PAGE_CACHE    = `pf-pages-${CACHE_VERSION}`;
const API_CACHE     = `pf-api-${CACHE_VERSION}`;

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/feed',
  '/discuss',
  '/offline',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon-32.png',
];

/* ── Install: pre-cache shell assets ── */
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

/* ── Activate: clean up old caches ── */
self.addEventListener('activate', (event) => {
  const validCaches = [STATIC_CACHE, PAGE_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: routing strategies ── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // 1. Static assets → Cache First (icons, fonts, images)
  if (/\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 2. Public API (posts, stats, suggest) → Stale-While-Revalidate
  if (url.pathname.match(/\/api\/(posts|stats|users\/suggest)/)) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // 3. Same-origin page navigation → Network First with page cache fallback
  if (url.origin === self.location.origin && request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // 4. Everything else → Network only
});

/* ── Cache strategies ── */

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Return the offline fallback page
    return caches.match('/offline') || new Response('You are offline', {
      status: 503,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
