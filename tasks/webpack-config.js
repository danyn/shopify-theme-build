
const webpack = require('webpack');

function jsCompiler(config) {

  return new Promise(resolve => webpack(config, (err, stats) => {

      if (err) console.log('Webpack: ', err)

      console.log(stats.toString({ /* stats options */ }))

      resolve()
    }))
}


module.exports = jsCompiler;
