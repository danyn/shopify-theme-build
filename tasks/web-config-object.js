
const path = require('path');

/* 
***definition of paths object

const paths = {
  src_resolve: '../site',
  src_file: './src/js/chinook.js',
  out_resolve: '../bulk/js/theme/',
  out_file: './chinook.js'
  }

**
*/

// take a paths object and return a webpack config object based on that

function webpackConfigObject (paths_object) {
  const {src_resolve, src_file, out_resolve, out_file} = paths_object;
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

module.exports = webpackConfigObject;
