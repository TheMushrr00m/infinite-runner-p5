/* global __dirname */

var path = require('path');

var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var dir_js = path.resolve(__dirname, 'src/js');
var dir_html = path.resolve(__dirname, 'src/html');
var dir_assets = path.resolve(__dirname, 'src/assets');
var dir_public = path.resolve(__dirname, 'public');
var dir_build = path.resolve(__dirname, 'build');

module.exports = {
    entry: path.resolve(dir_js, 'game.js'),
    output: {
        path: dir_build,
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: dir_build
        //, host: 'f45c899e7b05.ant.amazon.com'
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                test: dir_js,
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(), // Enable HMR

        // Simply copies the files over
        new CopyWebpackPlugin([
            { from: dir_html }, // to: output.path
            { from: dir_public }, // to: output.path
            { from: dir_assets, to: 'assets' } // to: output.path
        ]),
        // Avoid publishing files when compilation fails
        new webpack.NoErrorsPlugin()
    ],
    stats: {
        // Nice colored output
        colors: true
    },
    // Create Sourcemaps for the bundle
    devtool: 'source-map',
};
