/// <reference path="saveAs.d.ts"/>
import { saveAs } from "browser-filesaver";

export interface FetchOptions {
    method?: "get"|"post"|"put"|"delete";
    headers?: {[key: string]: string};
    body?: ArrayBuffer|Blob|Document|FormData;
    onProgress?: (e: ProgressEvent) => void;
    responseType?: XMLHttpRequestResponseType;
}

const origin = window.location.protocol + '//' + window.location.host;
export function fetch(url: string, opts: FetchOptions = {}, cors: string = "cors.ized.io"): Promise<ArrayBuffer> {
    const cors_url = "https://" + cors + "/";
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


export const nop = () => {};

export function saveToFile(data: Blob|Uint8Array, filename: string) {
    const blob = new Blob([data], {type: "octet/stream"});
    saveAs(blob, filename);
}

