const CORE_CACHE = "menu-cache-v5";
const IMAGE_CACHE = "menu-images-v5";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./menu.json",
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![CORE_CACHE, IMAGE_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );

  // Kontrolle über alle offenen Tabs übernehmen
  self.clients.claim();
});

// FETCH: Bilder automatisch cachen
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Bilder separat cachen (iOS-safe)
  if (request.destination === "image") {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      })
    );
    return;
  }

  // Standard: Cache First, dann Network
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).catch(() => {
          if (request.destination === "document") {
            return caches.match("./index.html");
          }
        })
      );
    })
  );
});

// UPDATE TRIGGER vom Frontend
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
