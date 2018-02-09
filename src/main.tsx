
import * as React from "react";
import { render } from "react-dom";

import { FFmpegWorker } from "./libs/ffmpeg";
import { App } from "./components/app";

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

    const app = (<App/>);
    
    FFmpegWorker.singleton();

    render(app, document.getElementById("app"));

}

main();