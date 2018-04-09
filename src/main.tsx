/// <reference path="sw.d.ts"/>

import * as React from "react";
import { render } from "react-dom";
import * as Radium from "radium";

import { FFmpegWorker } from "./libs/ffmpeg";
import { App } from "./components/app";

import { register } from "serviceworker-webpack-plugin/lib/runtime";

const windowEvent = (event: string) => new Promise(resolve => window.addEventListener(event, ev => resolve(ev)));

/**
 * Entry Point
 */
async function main() {

    const app = (
        <Radium.StyleRoot>
            <App />
        </Radium.StyleRoot>
    );
    
    FFmpegWorker.singleton();

    render(app, document.getElementById("app"));
    if ("serviceWorker" in navigator) {
        await windowEvent("load");
        try {
            const registration = register();
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