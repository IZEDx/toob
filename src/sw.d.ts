declare module "serviceworker-webpack-plugin/lib/runtime" {
    export function register(): ServiceWorkerRegistration;
}

interface ServiceWorkerEvent extends Event {
    waitUntil<T>(promise: Promise<T>): void;
    respondWith(promise: Promise<Response>): void;
    request: Request;
}