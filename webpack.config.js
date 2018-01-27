const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const AsyncModulePlugin = require('async-module-loader/plugin');

const extractSass = new ExtractTextPlugin("style.css");
const extractHtml = new ExtractTextPlugin("index.html");

module.exports = {
    entry: './src/main.ts',
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 9000
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.sass', '.html', '.js', '.json']
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            },
            {
                test: /\.sass$/,
                use: extractSass.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "resolve-url-loader"
                    }, {
                        loader: "sass-loader"
                    }],
                    fallback: "style-loader"
                })
            },
            {
                test: /\.html$/,
                use: extractHtml.extract("html-loader")
            },
            { 
                enforce: "pre", 
                test: /\.js$/, 
                loader: "source-map-loader" 
            }
        ]
    },
    plugins: [
        extractSass, extractHtml,
        new CopyWebpackPlugin([
            { from: 'node_modules/ffmpeg.js/ffmpeg-worker-mp4.js' },
        ]),
        new AsyncModulePlugin()
    ],
    externals: {
    },
};