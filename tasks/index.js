const gulp = require('gulp');

function watchCSS() {
  const CSSsrcWatch  = './site/src/css/**/*.css';
  const CSSsrc  = './site/src/css/style.css';
  const CSSdest = './site/dist/css/';
  const postcss = require('gulp-postcss');
  
  function CSScompiler() {
    return gulp.src(CSSsrc)
          .pipe( postcss([ require('postcss-import'), require('autoprefixer'), require('postcss-nested')]) )
          .pipe( gulp.dest(CSSdest) );
  }
  gulp.watch(CSSsrcWatch, CSScompiler);
}

function watchJS() {
  const JScompiler = require('./webpack-config');
  const JSsrc = './site/src/js/**/*.js';
  gulp.watch(JSsrc, JScompiler);
}


const watch = gulp.parallel( watchJS, watchCSS );



exports.watch = watch;

