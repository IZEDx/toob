//import * as $ from "jquery";
import { getInfo } from "ytdl-core";
//import { Observable } from "./async";


export async function downloadVideo(id: string): Promise<Uint8Array> {
    const info = await getInfo(id);
    const format = info.formats.find(format => format.audioBitrate >= 128 && format.container === "mp4");

    if (format === undefined) {
        throw new Error("Could not find viable format.");
    }

    const response = await fetch(format.url);
    if (response.body === null) {
        throw new Error("Could not fetch file.");
    }

    return new Promise<Uint8Array>(resolve => {
        const fr = new FileReader();
        fr.onload = function() {
           resolve(new Uint8Array(this.result));
        };
        response.blob().then(blob => fr.readAsArrayBuffer(blob));
    });
}