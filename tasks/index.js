const gulp = require('gulp');
// core gulp modules
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

//global file locations
const dist_shopify_snippets = './site/dist/snippets/';
const bulk_shopify_snippets = './bulk/shopify/templates/css/';
const bulk_nunjucks_css = './bulk/nunjucks-css/*.liquid';
const src_shopify_theme = './site/src/shopify/**/*.*';
const dist_shopify_theme = './site/dist/';
const src_shopify_templates = './site/src/shopify/templates/';
const src_shopify_templates_css  = `${src_shopify_templates}**/*.css`;
const bulk_shopify_templates_css = './bulk/shopify/templates/css/';

const src_shopify_all_but_templates = [`${src_shopify_theme}`, `!${src_shopify_templates}**/*.*`];

// in case we need to iterate more tightly

const src_shopify_template_dirs = [ `${src_shopify_templates}404/*.liquid`,
                                    `${src_shopify_templates}article/*.liquid`,
                                    `${src_shopify_templates}blog/*.liquid`,
                                    `${src_shopify_templates}cart/*.liquid`,
                                    `${src_shopify_templates}collection/*.liquid`,
                                    `${src_shopify_templates}gift_card/*.liquid`,
                                    `${src_shopify_templates}index/*.liquid`,
                                    `${src_shopify_templates}list-collections/*.liquid`,
                                    `${src_shopify_templates}page/*.liquid`,
                                    `${src_shopify_templates}page.contant/*.liquid`,
                                    `${src_shopify_templates}password/*.liquid`,
                                    `${src_shopify_templates}product/*.liquid`,
                                    `${src_shopify_templates}search/*.liquid` ];

const src_shopify_template_customers =  `${src_shopify_templates}customers/*.liquid`;

function cssDevCompiler(fromCssLocation, toCompiledCssLocation) {
  return gulp.src(fromCssLocation)
        .pipe(postcss([css_import, css_nesting, css_vars, css_prefixer]))
        .pipe(replace("'{{'", '{{'))
        .pipe(replace("'}}'", '}}'))
        .pipe(gulp.dest(toCompiledCssLocation));
}

function __cssDevCompiler() {
  return cssDevCompiler(src_shopify_templates_css, bulk_shopify_templates_css);
}

function cssDevConcatenator(fromCssLocation, ToCssLocation, toCssFileName) {
  return gulp.src(fromCssLocation)
  .pipe(concat(toCssFileName))
  .pipe(gulp.dest(ToCssLocation));
}

function __cssDevConcatenator() {
 return cssDevConcatenator(`${bulk_shopify_templates_css}**/*.css.liquid`, bulk_shopify_snippets, 'cj_all-templates-css.liquid');
}

function cssDevSnippets() {
  return gulp.src(`${bulk_shopify_snippets}**/*.css`)
        .pipe(gulp_rename({ prefix: "_", suffix: ".css", extname: '.liquid' }))
        .pipe(gulp_flatten())
        .pipe(gulp.dest(`${dist_shopify_theme}snippets`));
}

function watchCssDev() {
  // watch all css templates/
  gulp.watch(src_shopify_templates_css, function watching_shopify_templates_for_css(done) {
    cssDevCompiler(src_shopify_templates_css, bulk_shopify_templates_css);
    cssDevConcatenator(`${bulk_shopify_templates_css}**/*.css`, bulk_shopify_snippets, 'cj_all-templates-css.liquid');
    done();
  });
}

function nunjucksCss() {
  return gulp.src(bulk_nunjucks_css)
         .pipe(nunjucksRender({
          inheritExtension: true,
          path: './bulk'
         }))
         .pipe(gulp.dest(dist_shopify_snippets));
}
// templates must be copied separately because src folder structure places css with templates/  for modular css
function copyThemeTemplates() {
  return gulp.src(src_shopify_template_dirs)
  .pipe(gulp.dest(`${dist_shopify_theme}templates/`));
}

function copyThemeTemplatesCustomers() {
  return gulp.src(src_shopify_template_customers)
  .pipe(gulp.dest(`${dist_shopify_theme}templates/customers`));
}

function copyTheme() {
  return gulp.src(src_shopify_all_but_templates)
  .pipe(gulp.dest(dist_shopify_theme));
}


function watchJS() {
  const JScompiler = require('./webpack-config');
  const JSsrc = './site/src/js/**/*.js';
  gulp.watch(JSsrc, JScompiler);
}

const watchDev = gulp.parallel(watchCssDev);
const buildDev = gulp.series(__cssDevCompiler, cssDevSnippets, copyTheme, copyThemeTemplates, copyThemeTemplatesCustomers, nunjucksCss);

// const watchDev = gulp.parallel( watchJS, watchCSS );

exports.watchDev = watchDev;
exports.buildDev = buildDev;


// test individual function from npm run
exports.concatCSS = __cssDevConcatenator;


/* notes:
 ignore an error put as final stip in chain
 .on('error', function (err) { console.log(err.toString()); this.emit('end');})

 flatten folder structure: https://stackoverflow.com/questions/24658011/can-you-remove-a-folder-structure-when-copying-files-in-gulp


*/