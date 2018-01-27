
const cors_api_host = "cors-anywhere.herokuapp.com";
const cors_api_url = "https://" + cors_api_host + "/";
const origin = window.location.protocol + '//' + window.location.host;
export function fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    if (typeof input === "string") {
        const targetOrigin = /^https?:\/\/([^\/]+)/i.exec(input);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin && targetOrigin[1] !== cors_api_host) {
            input = cors_api_url + input;
        }
    }
    return window.fetch(input, init);
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