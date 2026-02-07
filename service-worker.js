const CORE_CACHE = "menu-cache-v8";
const IMAGE_CACHE = "menu-images-v8";

const FILES_TO_CACHE = [
  ".",
  "./index.html",
  "./style.css",
  "./script.js",
  "./rezepte.js",
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

// INSTALL → sofort aktivieren
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(FILES_TO_CACHE)),
  );
});

// ACTIVATE → alte Caches löschen & Kontrolle übernehmen
self.addEventListener("activate", (event) => {
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

  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  const request = event.request;

  //NAVIGATION ZUERST (PWA Start / Reload / Flugmodus)
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(".").then((cached) => {
        return cached || caches.match("./index.html");
      }),
    );
    return;
  }

  //menu.json → Network First
  if (request.url.endsWith("menu.json")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CORE_CACHE).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  //Images → Cache First
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
      }),
    );
    return;
  }

  //Alles andere → Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request);
    }),
  );
});
