const sass = require('@stencil/sass');

exports.config = {
    namespace: "toob",
    outputTarget: [
        {
            type: 'www',
            serviceWorker: {
                swSrc: 'src/sw.ts'
            }
        }
    ],
    globalStyle: 'src/global/style.scss',
    plugins: [
        sass()
    ],
    copy: [
        { src: 'node_modules/ffmpeg.js/ffmpeg-worker-mp4.js' }
    ]
};

exports.devServer = {
    root: 'www',
    watchGlob: '**/**'
};
