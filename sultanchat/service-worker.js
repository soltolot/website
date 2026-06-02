// ==================================================
// SERVICE WORKER — SULTANCHAT PWA CACHE LAYER
// ==================================================

const CACHE_NAME = "sultanchat-v1";

// 🧱 STATIC APP SHELL (SAFE TO CACHE)
const STATIC_ASSETS = [
    "/chat.html",
    "/CSS/main.css",

    "/js/bootstrap.js",
    "/js/app.js",
    "/js/auth.js",
    "/js/chat.js",
    "/js/ui.js",
    "/js/error.js",
    "/js/supabase.js",

    "/assets/logo.png",
    "/manifest.json"
];

// --------------------------------------------------
// INSTALL — cache core files
// --------------------------------------------------
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );

    self.skipWaiting();
});

// --------------------------------------------------
// ACTIVATE — remove old caches
// --------------------------------------------------
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );

    self.clients.claim();
});

// --------------------------------------------------
// FETCH — cache-first strategy (SAFE HYBRID)
// --------------------------------------------------
self.addEventListener("fetch", (event) => {
    const url = event.request.url;

    // ❌ NEVER TOUCH SUPABASE (LIVE DATA)
    if (url.includes("supabase.co")) return;

    // ❌ NEVER TOUCH REALTIME SOCKETS
    if (url.includes("realtime") || url.startsWith("ws")) return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;

            return fetch(event.request)
                .then((response) => {
                    // Only cache valid GET responses
                    if (
                        event.request.method === "GET" &&
                        response.status === 200 &&
                        response.type === "basic"
                    ) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clone);
                        });
                    }

                    return response;
                })
                .catch(() => {
                    // fallback for main page
                    if (event.request.destination === "document") {
                        return caches.match("/chat.html");
                    }
                });
        })
    );
});
