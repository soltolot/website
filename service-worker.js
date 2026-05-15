const CACHE_NAME = "sultanchat-v1";

const FILES_TO_CACHE = [
    "/website/sultanchat/chat.html",
    "/website/sultanchat/assets/logo.png"
];

self.addEventListener("install", (event) => {
    console.log("Service worker installing...");

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request);
        })
    );
});
