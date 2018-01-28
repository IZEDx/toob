
import { EventWorker } from "./worker";
import { Observable, IObserver } from "./async";
import { tou8, nop } from "./utils";

type FFmpegMessageType = "ready"|"run"|"stdout"|"stderr"|"exit"|"done"|"error";

export interface FFmpegMessage {
    type: FFmpegMessageType;
    data?: string|FFmpegResult;
}   

export interface FFmpegResult {
    MEMFS: {name: string, data: string}[];
}

declare interface FFmpegWorker {
    emit(event: "ready"): void;
    on(event: "ready", cb: () => void): Function;
    once(event: "ready", cb?: () => void): Promise<void>;

    emit(event: "run"): void;
    on(event: "run", cb: () => void): Function;
    once(event: "run", cb?: () => void): Promise<void>;

    emit(event: "stdout", str: string): void;
    on(event: "stdout", cb: (str: string) => void): Function;
    once(event: "stdout", cb?: (str: string) => void): Promise<string>;

    emit(event: "stderr", str: string): void;
    on(event: "stderr", cb: (str: string) => void): Function;
    once(event: "stderr", cb?: (str: string) => void): Promise<string>;

    emit(event: "exit", str: string): void;
    on(event: "exit", cb: (str: string) => void): Function;
    once(event: "exit", cb?: (str: string) => void): Promise<string>;

    emit(event: "done", results: FFmpegResult[]): void;
    on(event: "done", cb: (results: FFmpegResult[]) => void): Function;
    once(event: "done", cb?: (results: FFmpegResult[]) => void): Promise<FFmpegResult[]>;

    emit(event: "error", str: string): void;
    on(event: "error", cb: (str: string) => void): Function;
    once(event: "error", cb?: (str: string) => void): Promise<string>;

    emit(event: FFmpegMessageType, str?: string): void;
    on(event: FFmpegMessageType, cb: (str?: string) => void): Function;
    once(event: FFmpegMessageType, cb?: (str?: string) => void): Promise<string|void>;
    
    emit(event: string, ...args: any[]): void;
    on(event: string, cb: (...args: any[]) => void): Function;
    once(event: string, cb?: (...args: any[]) => void): Promise<any>;
}

class FFmpegWorker extends EventWorker {
    static instance: FFmpegWorker;
    private _ready: boolean = false;

    constructor() {
        super("ffmpeg-worker-mp4.js");
        super.on("message", this.onMessage.bind(this));
        super.on("error", this.onError.bind(this));
        this.once("ready", () => this._ready = true);
    }

    static singleton() {
        if (this.instance === undefined) {
            this.instance = new FFmpegWorker();
        }
        return this.instance;
    }

    private onMessage(e: MessageEvent) {
        const msg: FFmpegMessage = e.data;
        this.emit(msg.type, msg.data);
    }

    private onError(err: string) {
        this.emit("error", err);
    }

    public async waitReady(): Promise<boolean> {
        return this._ready || await this.once("ready") || true;
    }

    public convert(data: Blob, args?: string[]): Observable<string> {
        return Observable.create(async (observer: IObserver<string>) => {
            if (!this._ready) {
                await this.once("ready");
            }

            const ab: Uint8Array = await new Promise<Uint8Array>(resolve => {
                const fr = new FileReader();
                fr.onload = function() {
                   resolve(new Uint8Array(this.result));
                };
                fr.readAsArrayBuffer(data);
            });

            this.worker.postMessage({
                type: "run", 
                arguments: args || [],
                MEMFS: [{name: "in.mp4", ab}]
            });

            const unout = this.on("stdout", observer.next.bind(observer));
            const unerr = this.on("stderr", !!observer.error ? observer.error.bind(observer) : nop);

            await this.once("done");

            //observer.next(res.MEMFS[0].data);

            unout();
            unerr();

            if (!!observer.complete) {
                observer.complete();
            }
        });
    }

    public async convertToMp3(data: Uint8Array): Promise<Uint8Array> {
        await this.waitReady();

        this.worker.postMessage({
            type: "run", 
            arguments: ["-i", "in.mp4", "-codec:a", "libmp3lame", "-qscale:a", "2", "out.mp3"],
            MEMFS: [{name: "in.mp4", data}]
        });
        
        const results = await this.once("done");
        
        if (results.length === 0 || results[0].MEMFS.length === 0) {
            throw new Error("Could not convert file.");
        }

        return tou8(results[0].MEMFS[0].data);
    }

}

export { FFmpegWorker };