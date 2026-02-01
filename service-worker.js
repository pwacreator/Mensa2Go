const CORE_CACHE = "menu-cache-v1";
const IMAGE_CACHE = "menu-images-v1";

const FILES_TO_CACHE = [
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./theme-switch.js",
  "./menu.json",
  "./assets/icons/icon-48.png",
  "./assets/icons/icon-72.png",
  "./assets/icons/icon-96.png",
  "./assets/icons/icon-144.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-256.png",
  "./assets/icons/icon-512.png",
];

//Install: Core-Dateien vorab cachen
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(FILES_TO_CACHE)),
  );
});

//Fetch: Bilder automatisch cachen
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.destination === "image") {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;

          return fetch(request).then((response) => {
            // iOS-Schutz
            if (!response || response.status !== 200) {
              return response;
            }
            cache.put(request, response.clone());
            return response;
          });
        }),
      ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      return (
        response ||
        fetch(request).catch(() => {
          if (request.destination === "document") {
            return caches.match("./index.html");
          }
        })
      );
    }),
  );
});

//Alte Caches löschen
self.addEventListener("activate", (event) => {
  self.clients.claim();
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![CORE_CACHE, IMAGE_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});
