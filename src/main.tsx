
import * as React from "react";
import { render } from "react-dom";

import { FFmpegWorker } from "./libs/ffmpeg";
import { App } from "./components/app";

/**
 * Entry Point
 */
async function main() {

    const app = (<App/>);
    
    FFmpegWorker.singleton();

    render(app, document.getElementById("app"));

}

/**
 * Call Entry Point
 */
main();