
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
    const ffmpeg: FFmpegWorker = new FFmpegWorker();
    console.log("Loading FFmpeg...");

    let filename = "";
    let id = "";
    let video: Uint8Array = <any>null;

    $("#app > .search > input").change(async ev => {
        const search: string = ""+$(ev.target).val();
        console.log("Searching...");
        $("#app .status").text("Searching...");
        try {
            const info = await getInfo(search);

            $("#app > .infoview > .title").text(info.title);
            $("#app > .infoview").css("display", "grid");

            $("#app .download").css("display", "inline-block");
            $("#app .convert-mp3").css("display", "none");
            $("#app .convert-mp4").css("display", "none");

            filename = info.video_id;
            id = info.video_id;

            $("#app .status").text("Ready");
            console.log("Found: " + info.title);
        } catch (err) {
            $("#app > .infoview").css("display", "none");

            console.log("Not found.")
        }
    });

    $("#app .download").click(async () => {
        console.log("Downloading: " + id);
        $("#app .status").text("Downloading...");
        $("#app .download").attr("disabled", "disabled");
        try {
            video = await downloadVideo(id);
            $("#app .convert-mp3").css("display", "inline-block");
            $("#app .convert-mp4").css("display", "inline-block");
            $("#app .download").removeAttr("disabled");
            $("#app .download").css("display", "none");
            $("#app .status").text("Download successful");
        } catch(err) {
            console.error(err);
            $("#app .download").removeAttr("disabled");
            $("#app .status").text("Download failed");
        }
    });

    $("#app .convert-mp4").click(async () => {
        try {
            $("#app .status").text("Saving as MP4...");
            saveToFile(video, filename + ".mp4");
            $("#app .status").text("Saved");
        } catch(err) {
            console.error(err);
            $("#app .status").text("Error saving as MP4");
        }
    });

    $("#app .convert-mp3").click(async () => {
        try {
            $("#app .status").text("Converting to MP3...");
            const audio = await ffmpeg.convertToMp3(video);

            $("#app .status").text("Saving as MP3...");
            saveToFile(audio, filename + ".mp3");
            $("#app .status").text("Saved");
        } catch(err) {
            console.error(err);
            $("#app .status").text("Error saving as MP3");
        }
    });

    await ffmpeg.waitReady();
    console.log("FFmpeg ready!");
    $("#app > .search > input").removeAttr("disabled");
    $("#app > .search > input").focus();

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