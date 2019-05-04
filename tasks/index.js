const gulp = require('gulp');
// core gulp modules
const replace = require('gulp-replace');
var concat = require('gulp-concat');
// post css modules
const postcss = require('gulp-postcss');
const css_import = require('postcss-import');
const css_prefixer =  require('autoprefixer');
const css_nesting = require('postcss-nested');
const css_vars = require('postcss-simple-vars');

//global file locations
const dist_shopify_snippets = './dist/snippets/';
const src_shopify_templates  = './site/src/shopify/templates/**/*.css';
const bulk_shopify_templates_css = './bulk/shopify/templates/css/';


function cssDevCompiler(fromCssLocation, toCompiledCssLocation) {
  return gulp.src(fromCssLocation)
        .pipe(postcss([css_import, css_nesting, css_vars, css_prefixer]))
        .pipe(replace("'{{'", '{{'))
        .pipe(replace("'}}'", '}}'))
        .pipe(gulp.dest(toCompiledCssLocation));
}

function cssDevConcatenator(fromCssLocation, ToCssLocation, toCssFileName) {
  return gulp.src(fromCssLocation)
  .pipe(concat(toCssFileName))
  .pipe(gulp.dest(ToCssLocation));
}

function buildCssDev(done) {
  cssDevCompiler(src_shopify_templates, bulk_shopify_templates_css);
  cssDevConcatenator(`${bulk_shopify_templates_css}**/*.css`, dist_shopify_snippets, 'all_templates.css');
  done();
}

function watchCssDev() {
  // watch all css templates/
  gulp.watch(src_shopify_templates, function watching_shopify_templates(done) {
    cssDevCompiler(src_shopify_templates, bulk_shopify_templates_css);
    cssDevConcatenator(bulk_shopify_templates_css, dist_shopify_snippets, 'all_templates.css');
    done();
  });
}

function watchJS() {
  const JScompiler = require('./webpack-config');
  const JSsrc = './site/src/js/**/*.js';
  gulp.watch(JSsrc, JScompiler);
}

const watchDev = gulp.parallel( watchCssDev );
const buildDev = gulp.parallel(buildCssDev);
// const watchDev = gulp.parallel( watchJS, watchCSS );


exports.watchDev = watchDev;
exports.buildDev = buildDev;

//  ignore an error put as final stip in chain
//  .on('error', function (err) { console.log(err.toString()); this.emit('end');})

// conditional upon NODE_ENV
