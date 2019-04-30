const gulp = require('gulp');
const jsCompiler = require('./webpack');
const JSsrc = './site/src/**/*.js';



function watchJS() {
  gulp.watch(JSsrc, jsCompiler);
}

const build = gulp.series( watchJS )



exports.build = build;

// function watchJS() {
//   watch(JSsrc, jsCompiler);
// }