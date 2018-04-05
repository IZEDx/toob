
self.addEventListener("install", (event: any) => event.waitUntil((async () => {
    const cache = await caches.open("toob");
    cache.addAll([
        '/img/Logo_250.png',
        '/img/Background_cropped.png',
        '/ffmpeg-worker-mp4.js',
        '/toob.js',
        '/sw.js',
        '/index.html',
        '/favicon.ico'
    ]);
})()));

self.addEventListener('fetch', (event: any) => event.respondWith((async () => {
    let response: Response = await caches.match(event.request);
    if (!response) {
        response = await fetch(event.request.clone());

        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const cache = await caches.open("toob");
        cache.put(event.request, response.clone());
    }
    return response;
})()));

self.addEventListener('activate', (event: any) => event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
        keys.filter(key => key === "/sw.js").map(key => caches.delete(key))
    );
})()));