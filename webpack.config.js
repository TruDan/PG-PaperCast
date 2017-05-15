/**
 * Created by truda on 09/05/2017.
 */
var path = require( 'path' );
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        game: "./src/game/index.js",
        controls: ["./src/controls/index.js", "./src/controls/styles/controls.scss"]
    },
    output: {
        filename: "./build/[name].bundle.js"
    },
    node: {
        fs: 'empty'
    },
    module: {
        loaders: [
            {
                test: /\.json$/,
                include: path.join(__dirname, 'node_modules', 'pixi.js'),
                loader: 'json',
            },
            {
                test: /node_modules/,
                loader: 'ify-loader'
            }
        ],
        rules: [
            { // regular css files
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    loader: 'css-loader?importLoaders=1',
                }),
            },
            { // sass / scss loader for webpack
                test: /\.(sass|scss)$/,
                loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({ // define where to save the file
            filename: './build/[name].bundle.css',
            allChunks: true,
        }),
    ],
    devServer: {
        host: '0.0.0.0',
        port: '3001',
        disableHostCheck: true
    }
};