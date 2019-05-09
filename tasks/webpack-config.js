// import path from 'path'
// import webpack from 'webpack'

const path = require('path');
const webpack = require('webpack');

const JsPaths = {
  src_resolve: '../site',
  src_file: './src/js/chinook.js',
  out_resolve: '../bulk/js/theme/',
  out_file: './chinook.js'
  }


// src_resolve, src_file, out_resolve, out_file


function webpackConfigObject (config_object) {
  const {src_resolve, src_file, out_resolve, out_file} = config_object;
  return {
      context: path.resolve(__dirname, src_resolve),
      entry: src_file,
      mode: 'development',
      output: {
          path: path.resolve(__dirname, out_resolve),
          filename: out_file
      },
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
      }
  }
}



function jsCompiler() {
// JsPaths.src.resolve, JsPaths.src.file, JsPaths.out.resolve, JsPaths.out.file
  const config = webpackConfigObject(JsPaths);  

  return new Promise(resolve => webpack(config, (err, stats) => {

      if (err) console.log('Webpack: ', err)

      console.log(stats.toString({ /* stats options */ }))

      resolve()
    }))
}



module.exports = jsCompiler;