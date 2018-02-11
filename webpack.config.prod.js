const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/main.tsx',
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, "assets"),
        compress: true,
        port: 9000
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: 'bundle.js',
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
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new CopyWebpackPlugin([
            { from: 'node_modules/ffmpeg.js/ffmpeg-worker-mp4.js' },
            { from: 'assets' },
            { from: 'src/index.html' }
        ])
    ],
    externals: {
    },
};