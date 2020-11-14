const gulp = require("gulp"),
  sass = require("gulp-sass"),
  plumber = require("gulp-plumber"),
  autoprefixer = require("gulp-autoprefixer"),
  nodemon = require("gulp-nodemon"),
  imagemin = require("gulp-imagemin"),
  rename = require("gulp-rename"),
  concat = require("gulp-concat"),
  changed = require("gulp-changed"),
  debug = require('gulp-debug'),
  liveReload = require("gulp-livereload")
  svgSymbols = require('gulp-svg-symbols');

const paths = {
  scripts: {
    src: "./src/js/*.js",
    dest: "./dist/js/",
  },
  styles: {
    src: "./src/scss/**/*.scss",
    dest: "./dist/css/",
  },
  images: {
    src: "./src/images/ready/*",
    dest: "./dist/images/",
  },
  views: {
    src: "./src/views/**/*.ejs",
    dest: "./",
  },
  icons: {
    src: "./src/images/icons/*.svg",
    dest: "./dist/images/icons/"
  },
  html: {
    src: "./src/*.html",
    dest: "./dist/"
  }
};

function icons() {
  return (
    gulp
      .src(paths.icons.src)
      .pipe(plumber())
      .pipe(svgSymbols({
        style: 'positon: absolute;',
        'aria-hidden': 'true'
      }))
      .pipe(gulp.dest(paths.icons.dest))
      .pipe(liveReload())
  );
}

function styles() {
  return (
    gulp
      .src(paths.styles.src)
      .pipe(plumber())
      .pipe(sass())
      .pipe(
        autoprefixer({
          overrideBrowserslist: ["last 2 versions"],
          cascade: false,
        })
      )
      .pipe(sass({ outputStyle: "expanded" }))
      .pipe(concat("styles.css"))
      .pipe(gulp.dest(paths.styles.dest))
      .pipe(sass({ outputStyle: "compressed" }))
      .pipe(rename("styles.min.css"))
      .pipe(gulp.dest(paths.styles.dest))
      .pipe(liveReload())
  );
}

function imgmin() {
  return (gulp
    .src(paths.images.src)
    .pipe(changed(paths.images.dest))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest))
    .pipe(liveReload())
  );
}

async function runServer(done) {
  let called = false;
  return await nodemon({
    script: "app.js",
    ignore: ["gulpfile.js", "node_modules/"],
    env: { NODE_ENV: "development" },
    done: done,
  })
    .on("start", function () {
      if (!called) {
        called = true;
        done();
      }
    })
    .on("restart", function () {
      setTimeout(function () {
        liveReload.reload();
      }, 1000);
    }
  );
}

function html() {
  return( gulp
    .src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
  );
}

function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(plumber())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(liveReload());
}

function views(done) {
  liveReload.reload();
  done();
}

function watchTask() {
  liveReload.listen();
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.images.src, imgmin);
  gulp.watch(paths.views.src, views);
  gulp.watch(paths.icons.src, icons);
  gulp.watch(paths.html.src, html);
}

const dev = gulp.parallel([runServer, watchTask]);
const build = gulp.series([icons, imgmin, scripts, styles, html]);

exports.imgmin = imgmin;
exports.build = build;
exports.default = dev;
