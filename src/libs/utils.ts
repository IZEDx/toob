
export interface FetchOptions {
    method?: "get"|"post"|"put"|"delete";
    headers?: {[key: string]: string};
    body?: ArrayBuffer|Blob|Document|FormData;
    onProgress?: (e: ProgressEvent) => void;
    responseType?: XMLHttpRequestResponseType;
}

const origin = window.location.protocol + '//' + window.location.host;
export function fetch(url: string, opts: FetchOptions = {}, cors: string = "toob.host:8090"): Promise<ArrayBuffer> {
    const cors_url = "http://" + cors + "/";
    const targetOrigin = /^https?:\/\/([^\/]+)/i.exec(url);
    if (targetOrigin && targetOrigin[0].toLowerCase() !== origin && targetOrigin[1] !== cors) {
        url = cors_url + url;
    }

    return new Promise<ArrayBuffer>((res, rej) => {
        const xhr = new XMLHttpRequest();
        xhr.open(opts.method || "get", url);
        xhr.onload = e => {
            res(xhr.response);
        }
        xhr.onerror = e => {
            rej(e);
        }
        if (opts.onProgress) {
            xhr.onprogress = opts.onProgress;
        }
        if (opts.responseType) {
            xhr.responseType = opts.responseType;
        }

        opts.headers = opts.headers || {};
        for (const k in opts.headers) {
            xhr.setRequestHeader(k, opts.headers[k]);
        }

        xhr.send(opts.body);
    });
}

export async function downloadFile(url: string, onProgress?: (e: ProgressEvent) => void): Promise<Uint8Array> {

    const buff = await fetch(url, {onProgress, responseType: "arraybuffer"});
    return new Uint8Array(buff);
}


export function tou8(buf: Uint8Array|string|SharedArrayBuffer): Uint8Array {
    if (buf.constructor.name === 'Uint8Array'
    || buf.constructor === Uint8Array) {
        return buf as Uint8Array;
    }
    if (typeof buf === 'string') buf = new Buffer(buf);
    var a = new Uint8Array(buf.length);
    for (var i = 0; i < buf.length; i++) a[i] = buf[i];
    return a;
}

export const nop = () => {};


const fsElement = document.createElement("a");
document.body.appendChild(fsElement);
fsElement.style.display = "none";
export function saveToFile(data: Blob|Uint8Array, filename: string) {
    const blob = new Blob([data], {type: "octet/stream"});
    const url = window.URL.createObjectURL(blob);
    fsElement.href = url;
    fsElement.download = filename;
    fsElement.click();
    window.URL.revokeObjectURL(url);
}