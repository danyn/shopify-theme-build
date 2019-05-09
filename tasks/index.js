// node modules
var fs = require('fs');
// core gulp modules
const gulp = require('gulp');
const replace = require('gulp-replace');
var concat = require('gulp-concat');
var nunjucksRender = require('gulp-nunjucks-render');
const gulp_flatten = require('gulp-flatten');
const gulp_rename = require('gulp-rename');
// post css modules
const postcss = require('gulp-postcss');
const css_import = require('postcss-import');
const css_prefixer =  require('autoprefixer');
const css_nesting = require('postcss-nested');
const css_vars = require('postcss-simple-vars');
// shopify themekit
const themeKit = require('@shopify/themekit');
const themekit_path = './site/dist/';
//webpack and webpack config object
const JScompiler = require('./webpack-config');

//global file locations
const bulk = './bulk';
const src = './site/src';
const dist = './site/dist';
const themeCss = `${src}/css/chinook-theme.css`;

const bulk_nunjucks_css = `${bulk}/nunjucks-css/*.liquid`;

const src_shopify_templates = `${src}/shopify/templates`;
const src_shopify_templates_css  = `${src_shopify_templates}/**/*.css`;
const src_shopify_templates_js = `${src_shopify_templates}/**/*.js`

const src_shopify_less_templates = [`${src}/shopify/**/*.*`, 
                                   `!${src_shopify_templates}/**/*.*`
                                   ];

const src_shopify_template_customers =  `${src_shopify_templates}/customers/*.liquid`;

// themekit commands
function themekitDeploy(done) {
  themeKit.command('deploy', {env: 'development'}, {cwd: themekit_path });
  done();
}

function themekitWatch() {
  return themeKit.command('watch', {env: 'development'}, {cwd: themekit_path });
 
}

// css functions

function cssDevCompiler(fromCssLocation, toCompiledCssLocation) {
  return gulp.src(fromCssLocation,  {since: gulp.lastRun(cssDevCompiler)})
        .pipe(postcss([css_import, css_nesting, css_vars, css_prefixer]))
        .pipe(replace("'{{'", '{{'))
        .pipe(replace("'}}'", '}}'))
        .pipe(gulp.dest(toCompiledCssLocation));
}

function __cssDevCompileTemplates() {
  return cssDevCompiler(`${src}/shopify/templates/**/*.css`, `${bulk}/css/templates/`);
}

function __cssDevCompileTheme() {
  // /css/chinook-theme.css
  return cssDevCompiler(`${src}/css/**/*.css`, `${bulk}/css/` );
}

function cssDevSnippets() {
  const paths = {
    src: [`${bulk}/css/**/*.css`,`!${bulk}/css/**/_*`],
    dest: `${dist}/snippets/`
  };
  // , {since: gulp.lastRun(cssDevSnippets)} can't use this because the css includes not sure why.
  return gulp.src(paths.src)
        .pipe(gulp_rename({ prefix: "_", suffix: ".css", extname: '.liquid' }))
        .pipe(gulp_flatten())
        .pipe(gulp.dest(paths.dest));
}

function nunjucksCss() {
  return gulp.src(bulk_nunjucks_css)
         .pipe(nunjucksRender({
          inheritExtension: true,
          path: bulk
         }))
         .pipe(gulp.dest(`${dist}/snippets`));
}


function watchDevCss() {
  gulp.watch(`${src}/shopify/templates/**/*.css`, 
  gulp.series(__cssDevCompileTemplates, cssDevSnippets)
  );

  gulp.watch( `${src}/css/**/*.css`,
   gulp.series(__cssDevCompileTheme, cssDevSnippets, updateFileMeta)
  );
}



// js files

function jsBuildGlobal(done) {
  var promise = JScompiler();
  promise.then(function() {
   done();
  })
}


function jsBuildTemplates(done) {
  var paths = {
    
  }
  var promise = JScompiler();
  promise.then(function() {
   done();
  })
}



function jsDevSnippets() {
 const paths = {
   src: `${bulk}/js/theme/chinook.js`,
   dest: `${dist}/snippets/`
 }
 return gulp.src(paths.src)
         .pipe(gulp_rename({ prefix: "_", suffix: ".js", extname: '.liquid' }))
         .pipe(gulp.dest(paths.dest));
}

const jsDev = gulp.series(jsBuildGlobal, jsDevSnippets);

function watchDevJsTheme() {
 const jsSrc = `${src}/js/**/*.js`;
 gulp.watch(jsSrc, jsDev );
}

function watchDevJsTemplates() {

  const $jsSrc = `${src}/shopify/templates/**/*.js`

}


// shopify skeleton theme files

function copyThemeTemplates() {
  return gulp.src([`${src}/shopify/templates/**/*.liquid`, `!${src}/shopify/templates/customers/`])
        .pipe(gulp_flatten())
        .pipe(gulp.dest(`${dist}/templates/`));
}

function copyThemeTemplatesCustomers() {
  return gulp.src([`${src}/shopify/templates/customers/*.liquid`, `!${src}/shopify/templates/customers/*.css`])
        .pipe(gulp.dest(`${dist}/templates/customers`));
}

function copyTheme() {
  return gulp.src(src_shopify_less_templates)
        .pipe(gulp.dest(dist));
}

function updateFileMeta(done){
  // themekit does not update when the css partials update the parent include file.  So this updates the file meta in dist so themekit sees it.
   fs.utimes(`${dist}/snippets/_chinook-theme.css.liquid`, new Date(), new Date(), function(e){ if(e){console.log(e)}});
  done();
}


function watchShopify() {
  gulp.watch(`${src}/shopify/**/*.*`,
    gulp.series(copyThemeTemplates, copyThemeTemplatesCustomers, copyTheme)
    );
}



const watchOnly = gulp.parallel(themekitWatch, watchDevCss, watchDevJsTheme, watchShopify );
const watch = gulp.series(__cssDevCompileTemplates, __cssDevCompileTheme, cssDevSnippets, copyTheme, copyThemeTemplates, copyThemeTemplatesCustomers,  gulp.parallel(themekitWatch, watchDevCss));
const buildDev = gulp.series(__cssDevCompileTemplates, __cssDevCompileTheme, cssDevSnippets, jsDev, copyTheme, copyThemeTemplates, copyThemeTemplatesCustomers, themekitDeploy);
// const watchDevCss = gulp.parallel( watchJS, watchCSS );

exports.watch= watch;
exports.watchOnly = watchOnly;
exports.buildDev = buildDev;

// test individual function from npm run
exports.buildJS = jsDev;
