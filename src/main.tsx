
import * as React from "react";
import { render } from "react-dom";

import { FFmpegWorker } from "./libs/ffmpeg";
import { App } from "./components/app";

const windowEvent = (event: string) => new Promise(resolve => window.addEventListener(event, ev => resolve(ev)));

/**
 * Entry Point
 */
async function main() {

    const app = (<App/>);
    
    FFmpegWorker.singleton();

    render(app, document.getElementById("app"));
    if ("serviceWorker" in navigator) {
        await windowEvent("load");
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        } catch (err) {
            console.log('ServiceWorker registration failed: ', err);
        }
    }
}

/**
 * Call Entry Point
 */
main();