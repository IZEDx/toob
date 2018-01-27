import { EventEmitter } from "./events";

declare interface EventWorker {
    emit(event: "message", e: MessageEvent): void;
    on(event: "message", cb: (e: MessageEvent) => void): Function;
    once(event: "message", cb?: (e: MessageEvent) => void): Promise<MessageEvent>;

    emit(event: "error", e: ErrorEvent): void;
    on(event: "error", cb: (e: ErrorEvent) => void): Function;
    once(event: "error", cb?: (e: ErrorEvent) => void): Promise<ErrorEvent>;

    emit(event: string, ...args: any[]): void;
    on(event: string, cb: (...args: any[]) => void): Function;
    once(event: string, cb?: (...args: any[]) => void): Promise<any>;
}

class EventWorker extends EventEmitter {
    worker: Worker;

    constructor(file: string) {
        super();
        this.worker = new Worker(file);
        this.worker.onmessage = (e: MessageEvent) => this.emit("message", e);
        this.worker.onerror = (e: ErrorEvent) => this.emit("error", e);
    }
}
export { EventWorker };