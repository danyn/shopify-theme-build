// import path from 'path'
// import webpack from 'webpack'

const path = require('path');
const webpack = require('webpack');


let config = {
    mode: 'production',
    entry: './src/js/app.js',
    output: {
        filename: './theme.js',
        path: path.resolve(__dirname, '../site/dest/js/')
    },
    context: path.resolve(__dirname, '../site'),
    module: {
        rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env']
                }
              }
            }
          ]
    },
    plugins: [
        new webpack.ProvidePlugin({
           $: 'jquery'
         })
    ]
}

function jsCompiler() {

    return new Promise(resolve => webpack(config, (err, stats) => {

        if (err) console.log('Webpack: ', err)

        console.log(stats.toString({ /* stats options */ }))

        resolve()
    }))
}



module.exports = jsCompiler;