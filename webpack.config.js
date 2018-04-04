const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        toob: "./src/main.tsx",
        sw: "./src/serviceworker.ts"
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: '[name].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            },
            { 
                enforce: "pre", 
                test: /\.js$/, 
                loader: "source-map-loader" 
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'node_modules/ffmpeg.js/ffmpeg-worker-mp4.js' },
            { from: 'assets' },
            { from: 'src/index.html' }
        ])
    ],
    externals: {
    },
};