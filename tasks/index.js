const gulp = require('gulp');
// core gulp modules
const replace = require('gulp-replace');
var concat = require('gulp-concat');
var nunjucksRender = require('gulp-nunjucks-render');
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

function cssDevConcatenator(fromCssLocation, ToCssLocation, toCssFileName) {
  return gulp.src(fromCssLocation)
  .pipe(concat(toCssFileName))
  .pipe(gulp.dest(ToCssLocation));
}

function buildCssDev(done) {
  cssDevCompiler(src_shopify_templates_css, bulk_shopify_templates_css);
  cssDevConcatenator(`${bulk_shopify_templates_css}**/*.css`, bulk_shopify_snippets, 'cj_all-templates-css.liquid');
  done();
}
// all_templates_css
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
// templates must be copied separately because the build structure places css with the template files
// in the same folder for modular css and later in production for getting css only for  pages
// that rely on them during http requests -> this function flattens the folder structure again.
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
const buildDev = gulp.series(buildCssDev, copyTheme, copyThemeTemplates, copyThemeTemplatesCustomers, nunjucksCss);
// , nunjucksCss
// const watchDev = gulp.parallel( watchJS, watchCSS );


exports.watchDev = watchDev;
exports.buildDev = buildDev;

//  ignore an error put as final stip in chain
//  .on('error', function (err) { console.log(err.toString()); this.emit('end');})

// conditional upon NODE_ENV
