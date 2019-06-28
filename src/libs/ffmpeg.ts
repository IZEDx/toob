
import { EventWorker } from "./worker";

function tou8(buf: Uint8Array|string|SharedArrayBuffer): Uint8Array {
    if (buf.constructor.name === 'Uint8Array'
    || buf.constructor === Uint8Array) {
        return buf as Uint8Array;
    }
    if (typeof buf === 'string') buf = new Buffer(buf);
    var a = new Uint8Array(buf.length);
    for (var i = 0; i < buf.length; i++) a[i] = buf[i];
    return a;
}

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

interface FFmpegTask {
    message: any;
    stdout: (s: string) => void;
    done: (data: Uint8Array) => void;
}

class FFmpegWorker extends EventWorker {
    static instance: FFmpegWorker;
    private _ready: boolean = false;
    private queue: FFmpegTask[] = [];

    constructor() {
        super("ffmpeg-worker-mp4.js");
        super.on("message", this.onMessage.bind(this));
        super.on("error", this.onError.bind(this));
        this.on("stderr", this.onStdErr.bind(this));
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

    private onStdErr(s: string) {
        if (this.queue.length === 0) {
            return;
        }
        this.queue[0].stdout(s);
    }


    public async waitReady(): Promise<void> {
        this._ready || await this.once("ready") || true;
    }

    private nextTask() {
        setImmediate(async () => {
            if (this.queue.length === 0) {
                return;
            }
    
            const task = this.queue[0];
    
            this.worker.postMessage(task.message);
            const results = await this.once("done");
    
            this.queue.splice(0,1);
            
            if (results.length === 0 || results[0].MEMFS.length === 0) {
                throw new Error("Could not convert file.");
            }
    
            setImmediate(() => task.done(tou8(results[0].MEMFS[0].data)));
        });
    }

    public async convert(message: any, stdout: (s: string) => void): Promise<Uint8Array> {
        await this.waitReady();
        return new Promise<Uint8Array>(res => {
            this.queue.push({
                message, stdout, done: (data: Uint8Array) => {
                    if (this.queue.length > 0) {
                        this.nextTask();
                    }
                    res(data);
                }
            });

            if ( this.queue.length === 1 ) {
                this.nextTask();
            }
        });
    }

    public convertWithProgress(message: any, onProgress: (progress: number) => void): Promise<Uint8Array> {
        let duration: number|null = null;
        return this.convert(message, s => {
            if (duration === null) {
                const res = /Duration: (\d+:\d+:\d+\.\d+), start:/.exec(s);
                if (res !== null) {
                    duration = ffmpegTimeToSeconds(res[1]);
                }
            } else if(duration > 0) {
                const res = /time=(\d+:\d+:\d+\.\d+) bitrate=/.exec(s);
                if (res !== null) {
                    const time = ffmpegTimeToSeconds(res[1]);
                    onProgress(100 / duration * (time || 0));
                }
            }
        });
    }


    public convertToMp3(data: Uint8Array, onProgress: (progress: number) => void = () => {}): Promise<Uint8Array> {
        return this.convertWithProgress({
            type: "run", 
            arguments: ["-y", "-i", "in.mp4", "-codec:a", "libmp3lame", "-qscale:a", "2", "out.mp3"],
            MEMFS: [{name: "in.mp4", data}]
        }, onProgress);
    }

}

export { FFmpegWorker };