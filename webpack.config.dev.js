const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, "assets"),
        compress: true,
        port: 9000
    }
});