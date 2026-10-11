// Minimal custom service worker — no Workbox dependency.
//
// Strategy:
//   - Cache-first for a small set of static shell assets (/, /manifest.json,
//     /icons/*). These rarely change and should load instantly offline.
//   - Network-first (effectively pass-through, no caching) for everything
//     else, INCLUDING all app/API routes.
//   - CRITICAL: anything under /api/pdf/ must NEVER be cached. PDF bytes and
//     the short-lived signed access tokens must never be written to the SW
//     cache or disk — those requests always go straight to the network and
//     are never even inspected for caching.

const CACHE_NAME = "examprep-static-v1";
const STATIC_ASSET_PREFIXES = ["/icons/"];
const STATIC_ASSET_EXACT = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSET_EXACT))
      .catch(() => {
        // Best-effort precache; don't fail install if offline during install.
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  if (STATIC_ASSET_EXACT.includes(url.pathname)) return true;
  return STATIC_ASSET_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never intercept non-GET (payments, mutations, etc.)

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // don't touch cross-origin requests

  // Absolute, non-negotiable: never cache or special-case anything under
  // /api/pdf/ — always a plain network passthrough.
  if (url.pathname.startsWith("/api/pdf/")) {
    return; // let the browser handle it natively, no caching layer involved
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Network-first / pass-through for everything else (pages, other APIs).
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((cached) => cached || Response.error()))
  );
});
