const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = merge(common, {
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new UglifyJsPlugin({
            uglifyOptions: {
                ecma: 8,
                parallel: true,
                output: {
                    comments: false,
                    beautify: false
                },
                safari10: true,
            }
        }),
        new CompressionPlugin({
          asset: "[path].gz[query]",
          algorithm: "gzip",
          test: /\.js$|\.css$|\.html$/,
          threshold: 10240,
          minRatio: 0.8
        })
    ]
});