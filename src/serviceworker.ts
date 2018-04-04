
const cacheName = "toob-shell"

self.addEventListener("install", async (event: any) => {
    const cache = await caches.open("toob-shell");
    event.waitUntil(cache.addAll([
        '/img/Logo_250.png',
        '/img/Background_cropped.png',
        '/ffmpeg-worker-mp4.js',
        '/toob.js',
        '/index.html',
        '/favicon.ico'
    ]));
});

self.addEventListener('fetch', async (event: any) => {
    const cache = await caches.open("toob-dynamic");
    let response = await cache.match(event.request);
    if (!response) {
        response = await fetch(event.request);
        cache.put(event.request, response.clone());
    }
    event.respondWith(response);
});

self.addEventListener('activate', async (event: any) => {
    const keys = await caches.keys();
    event.waitUntil(Promise.all(
        keys.filter(key => true).map(key => caches.delete(key))
    ));
});