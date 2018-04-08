
async function onInstall() {
    console.log("toob.host ServiceWorker installed.");
    const cache = await caches.open("toob");
    cache.addAll([
        "/img/Logo_250.png",
        "/img/Background_cropped.png",
        "/ffmpeg-worker-mp4.js",
        "/toob.js",
        "/sw.js",
        "/index.html",
        "/favicon.ico"
    ]);
}

function parallel<T extends () => Promise<K>, K = void>(...fns: T[]): Promise<K[]> {
    return Promise.all(fns.map(fn => fn()));
}

async function onFetch(event: ServiceWorkerEvent) {
    let response: Response = await caches.match(event.request);
    if (!response) {
        response = await fetch(event.request.clone());

        if(!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        parallel(async () => {
            const cache = await caches.open("toob");
            cache.put(event.request, response.clone());
        });
    }
    return response;
}

async function onActivate() {
    console.log("toob.host ServiceWorker activated, clearing cache.");
    const keys = await caches.keys();
    keys.map(key => caches.delete(key));
}

self.addEventListener("fetch", event => (event as ServiceWorkerEvent).respondWith(onFetch(event as ServiceWorkerEvent)));
self.addEventListener("activate", event => (event as ServiceWorkerEvent).waitUntil(onActivate()));
self.addEventListener("install", event => (event as ServiceWorkerEvent).waitUntil(onInstall()));