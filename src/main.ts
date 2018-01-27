
import "./index.html";
import "./sass/main.sass";

import * as $ from "jquery";
import { getInfo } from "ytdl-core";


import { FFmpegWorker } from "./libs/ffmpeg";
import { downloadVideo } from "./libs/youtube";
import { saveToFile } from "./libs/utils";


(function() {
    const cors_api_host = 'cors-anywhere.herokuapp.com';
    const cors_api_url = 'https://' + cors_api_host + '/';
    const slice = [].slice;
    const origin = window.location.protocol + '//' + window.location.host;
    const fetch = window.fetch;
    window.fetch = function() {
        const args = slice.call(arguments);
        const targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[0]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[0] = cors_api_url + args[0];
        }
        return fetch.apply(this, args);
    };
})();

async function main() {
    let ffmpeg: FFmpegWorker = new FFmpegWorker();
    console.log("Loading FFmpeg...");
    await ffmpeg.waitReady();
    console.log("FFmpeg ready!");

    $("#app > .search > input").change(async ev => {
        const search: string = ""+$(ev.target).val();
        try {
            const info = await getInfo(search);
            $("#app > .infoview > .title").text(info.title);
            $("#app > .infoview > .controls > .btn").attr("disabled");
        } catch (err) {
            alert(err);
            $("#app > .infoview > .title").text("");
            $("#app > .infoview > .controls > .btn").attr("disabled", "disabled");
        }
    });

    $("#app .convert-mp4").click(async () => {
        const search: string = ""+$("#app > .search > input").val();
        console.log(search);
        try {
            const video = await downloadVideo(search);
            saveToFile(video, "file.mp4");
        } catch(err) {
            alert(err);
        }
    });

    $("#app .convert-mp3").click(async () => {
        const search: string = ""+$("#app > .search > input").val();
        try {
            const video = await downloadVideo(search);
            const audio = await ffmpeg.convertToMp3(video);
            saveToFile(audio, "file.mp3");
        } catch(err) {
            alert(err);
        }
    });

    /*
    let video: Uint8Array = <any>null;
    let audio: Uint8Array = <any>null;

    await new Promise( (res,rej) => {
        setTimeout(res, 5000);
    });

    await Promise.all([
        (async () => {
            console.log("Loading FFmpeg...");
            await ffmpeg.waitReady();
            console.log("FFmpeg ready!");
        })(),
        (async () => {
            console.log("Downloading video...");
            video = await downloadVideo("MCn9lL94sxQ")
            console.log("Video downloaded!");
        })()
    ]);

    try {
        console.log("Converting video...");
        audio = await ffmpeg.convertToMp3(video);
        console.log("Done!");
    } catch(e) {
        console.log(e);
        console.error("Error converting the video:", e);
    }

    saveToFile(video, "video.mp4");
    saveToFile(audio, "audio.mp3");
    */
}

main();