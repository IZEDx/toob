
import { EventWorker } from "./worker";
import { tou8 } from "./utils";

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

export function ffmpegTimeToSeconds(timestr: string): number|null {
    const res = /(?:(\d+):(\d+):(\d+)\.(\d+))/.exec(timestr);
    if (res !== null) {
        return  parseInt(res[1]) * 3600 
                + parseInt(res[2]) * 60 
                + parseInt(res[3]) 
                + parseInt(res[4]) / 100;
    } else {
        return null;
    }
}

class FFmpegWorker extends EventWorker {
    static instance: FFmpegWorker;
    private _ready: boolean = false;

    set ready(v: boolean) {
        this._ready = v;
        if (v) {
            this.emit("ready");
        }
    }

    get ready() {
        return this._ready;
    }

    constructor() {
        super("ffmpeg-worker-mp4.js");
        super.on("message", this.onMessage.bind(this));
        super.on("error", this.onError.bind(this));
        this.once("ready", () => this.ready = true);
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

    public async waitReady(): Promise<void> {
        while (!this.ready) {
            await this.once("ready");
        }
    }

    public async convertToMp3(data: Uint8Array, onProgress: (progress: number) => void = () => {}): Promise<Uint8Array> {
        await this.waitReady();
        this.ready = false;

        let duration: number|null = null;
        const unsub = this.on("stderr", (s) => {
            if (duration === null) {
                const res = /Duration: (\d+:\d+:\d+\.\d+), start:/.exec(s);
                if (res !== null) {
                    duration = ffmpegTimeToSeconds(res[1]);
                }
            } else if(duration > 0) {
                const res = /time=(\d+:\d+:\d+\.\d+) bitrate=/.exec(s);
                if (res !== null) {
                    const time = ffmpegTimeToSeconds(res[1]);
                    console.log(time, res);
                    onProgress(100 / duration * (time || 0));
                }
            }
        });

        this.worker.postMessage({
            type: "run", 
            arguments: ["-y", "-i", "in.mp4", "-codec:a", "libmp3lame", "-qscale:a", "2", "out.mp3"],
            MEMFS: [{name: "in.mp4", data}]
        });
        
        const results = await this.once("done");
        
        unsub();
        this.ready = true;
        
        if (results.length === 0 || results[0].MEMFS.length === 0) {
            throw new Error("Could not convert file.");
        }

        return tou8(results[0].MEMFS[0].data);
    }

}

export { FFmpegWorker };