import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export const config: Config = {
    namespace: "toob",
    outputTargets: [
        {
            type: 'www',
            serviceWorker: {
                swSrc: 'src/sw.ts'
            }
        }
    ],
    globalStyle: 'src/global/style.scss',
    plugins: [
        sass(),
        nodePolyfills()
    ],
    copy: [
        { src: 'node_modules/ffmpeg.js/ffmpeg-worker-mp4.js' }
    ]
};

exports.devServer = {
    root: 'www',
    watchGlob: '**/**'
};
