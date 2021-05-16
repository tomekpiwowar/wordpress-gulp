"use strict";

const { src, dest, watch, series } = require("gulp");
const babel = require("gulp-babel");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleancss = require("gulp-clean-css");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");

// Here we set a prefix for our compiled and stylesheet and scripts.
// Note that this should be the same as the `$themeHandlePrefix` in `func-script.php` and `func-style.php`.

const themePrefix = "lp-gulp";

//Paths and files
const host = "http://localhost:8888/landing_page/";
const srcScss = "scss/**/*.scss";
const srcJsDir = "js";
const srcJsFiles = "js/scripts/*.js";
const destCss = "css";
const destJs = "js";

// Task for styles.
//Scss files are compiled and sent over to `assets/css/`.
function cssTask() {
  return src(srcScss, { sourcemaps: true })
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(rename(`${themePrefix}.min.css`))
    .pipe(cleancss())
    .pipe(dest(destCss, { sourcemaps: "." }));
}

// Task for scripts.
// Js files are uglified and sent over to `assets/js/scripts/`.
function jsTask() {
  return src(srcJsFiles, { sourcemaps: true })
    .pipe(babel())
    .pipe(concat(`${themePrefix}.min.js`))
    .pipe(uglify())
    .pipe(dest(destJs, { sourcemaps: "." }));
}

// Browsersync Tasks
function browsersyncServe(cb) {
  const files = [srcScss, "../*.php", "../**/*.php", srcJsFiles];
  browsersync.init(files, {
    proxy: host,
    notify: true,
  });
  cb();
}

function browsersyncReload(cb) {
  browsersync.reload();
  cb();
}

// Watch Task
function watchTask() {
  watch("../*.php", browsersyncReload);
  watch("../**/*.php", browsersyncReload);
  watch([srcScss, srcJsFiles], series(cssTask, jsTask, browsersyncReload));
}

// Default Gulp Task
exports.default = series(cssTask, jsTask, browsersyncServe, watchTask);
