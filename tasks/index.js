const gulp = require('gulp');
const replace = require('gulp-replace');
var concat = require('gulp-concat');

function watchCSS() {
  const CSSsrcWatch  = ['./site/src/**/*.css', './site/src/**/*.css.liquid' ];
  const CSSsrc  = './site/src/css/style.css.liquid';
  const CSSdest = './site/dist/assets/';
  const postcss = require('gulp-postcss');
  
  function CSScompiler( CSSfile, CSScompiled ) {
    return gulp.src(CSSfile)
          .pipe( postcss([ require('postcss-import'), require('autoprefixer'), require('postcss-nested'), require('postcss-simple-vars')]) )
          .pipe(replace("'{{'", '{{'))
          .pipe(replace("'}}'", '}}'))
          .pipe( gulp.dest( CSScompiled ) );
  }

  if (process.env.NODE_ENV === 'development') {
  gulp.watch(CSSsrcWatch, function CSSCompilation(done) {
    CSScompiler(CSSsrc, CSSdest);
    CSScompiler('./site/src/shopify/templates/product/product.css.liquid', CSSdest);
    done();
  });
  }else{

    return  gulp.src('./site/dist/assets/*.css.liquid')
           .pipe(concat('all.css'))
           .pipe(gulp.dest('./site/dist/snippets'));

  }
}

function watchJS() {
  const JScompiler = require('./webpack-config');
  const JSsrc = './site/src/js/**/*.js';
  gulp.watch(JSsrc, JScompiler);
}

const watchDev = gulp.parallel( watchCSS );
// const watchDev = gulp.parallel( watchJS, watchCSS );



exports.watchDev = watchDev;

//  ignore an error put as final stip in chain
//  .on('error', function (err) { console.log(err.toString()); this.emit('end');})

// conditional upon NODE_ENV
