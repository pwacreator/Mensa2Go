const CORE_CACHE = "menu-core-v3";
const IMAGE_CACHE = "menu-images-v3";

// Automatisch korrekten Base-Pfad ermitteln
const BASE_PATH = self.location.pathname.replace(/\/service-worker\.js$/, "");

const CORE_ASSETS = [
  BASE_PATH + "/",
  BASE_PATH + "/index.html",
  BASE_PATH + "/style.css",
  BASE_PATH + "/script.js",
  BASE_PATH + "/rezepte.js",
  BASE_PATH + "/manifest.json",
  BASE_PATH + "/theme-switch.js",
  BASE_PATH + "/menu.json",
  BASE_PATH + "/assets/icons/icon-48.png",
  BASE_PATH + "/assets/icons/icon-72.png",
  BASE_PATH + "/assets/icons/icon-96.png",
  BASE_PATH + "/assets/icons/icon-144.png",
  BASE_PATH + "/assets/icons/icon-192.png",
  BASE_PATH + "/assets/icons/icon-256.png",
  BASE_PATH + "/assets/icons/icon-512.png",
  BASE_PATH + "/assets/icons/icon-light.png",
  BASE_PATH + "/assets/icons/icon-dark.png",
];


// ==========================
// INSTALL
// ==========================
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});


// ==========================
// ACTIVATE
// ==========================
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

  self.clients.claim();
});


// ==========================
// FETCH
// ==========================
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // --------------------------
  // Navigation (HTML)
  // Network First + Offline Fallback
  // --------------------------
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(BASE_PATH + "/index.html")
      )
    );
    return;
  }

  // --------------------------
  // menu.json (Network First)
  // --------------------------
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
        .catch(() => caches.match(request))
    );
    return;
  }

  // --------------------------
  // Images (Cache First)
  // --------------------------
  if (request.destination === "image") {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          return caches.match(BASE_PATH + "/assets/icons/icon-192.png");
        }
      })
    );
    return;
  }

  // --------------------------
  // Static Assets (Cache First)
  // --------------------------
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request);
    })
  );
});
