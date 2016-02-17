var argv = require('yargs').argv;
var autoprefixer = require('gulp-autoprefixer');
var cache = require('gulp-cache');
var concat = require('gulp-concat');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var imagemin = require('gulp-imagemin');
var jshint = require('gulp-jshint');
var livereload = require('gulp-livereload');
var minifycss = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var rename = require("gulp-rename");
var replace = require('gulp-replace');
var sass = require('gulp-sass');
var spawn = require('child-proc').spawn;
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var map = require('map-stream');
var svgsprite = require('gulp-svg-sprite');

// Overload the original gulp _runTask method to allow the attribution of the current task
gulp.Gulp.prototype.__runTask = gulp.Gulp.prototype._runTask;
gulp.Gulp.prototype._runTask = function (task) {
  this.currentTask = task;
  this.__runTask(task);
};

// Log the errors properly when there is one
var customErrorHandler = function (error) {

  gutil.log(gutil.colors.red('Fatal error on the task \'' + error.plugin + '\'!!'));
  gutil.log(gutil.colors.red(error.message));
  gutil.log(gutil.colors.red(error.fileName + ' at line ' + error.lineNumber));

};

// Show the JSHint errors a better way
var customJshintReporter = function (notice) {

  return map(function (file, callback) {

    if (file.jshint && !file.jshint.success) {

      file.jshint.results.forEach(function (err) {

        if (err) {

          var error = file.jshint.results[0].error;
          var string = gutil.colors.red(error.reason) + ' (' + error.code + ') line: ' + gutil.colors.magenta(
            error.line) + ' / col: ' + gutil.colors.magenta(error.character);

          gutil.log(gutil.colors.red(file.jshint.results[0].file));
          gutil.log(string);

        }

      });

      if (notice !== true) {
        process.exit(1);
      }

    }

    callback(null, file);

  });

};

// Resolve the path depend on the original buildPath
var getBuildPath = function (path) {

  var switcherTasks = ['js-switcher', 'css-switcher', 'template', 'lightbox', 'integration'];
  path = path || '';

  if (switcherTasks.indexOf(this.currentTask.name) >= 0 && gulp.buildPath === 'dist') {
    // index files for dist method
    return gulp.buildPath + '/index/global_conf/' + path;
  } else if (switcherTasks.indexOf(this.currentTask.name) >= 0) {
    // index files for develop method
    return 'build/' + gulp.buildPath + '/global_conf/' + path;
  } else if (gulp.buildPath === 'dist') {
    // publication files for dist method
    return gulp.buildPath + '/flash/' + path;
  } else {
    // publication files for develop method
    return 'build/' + gulp.buildPath + '/publication/' + path;
  }

};

gulp.buildMode = (argv.env || 'prod');
gulp.buildPath = (argv.path || (argv._[0] === 'dist' ? 'dist' : 'master'));

if (argv.tasksSimple !== true) {

  gutil.log(gutil.colors.red('Environnement: '), gulp.buildMode);
  gutil.log(gutil.colors.red('Target:        '), gulp.buildPath);

}

/**
 *  CSS
 */
gulp.task('css', ['css-index', 'css-switcher', 'icon']);

gulp.task('css-index', function () {

  gulp.src('sources/css/**/*')
    .pipe(plumber({
      "errorHandler": customErrorHandler
    }))
    .pipe(sass())
    .pipe(autoprefixer(
      'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'ie 10', 'ie 11', 'opera 12.1', 'ios 6', 'Android 4',
      'iOS 6', 'iOS 7', 'iOS 8'
    ))
    .pipe(gulpif(gulp.buildMode === 'prod', minifycss()))
    .pipe(gulp.dest(getBuildPath.call(this) + 'mobile/css/'));

});

gulp.task('css-switcher', function () {

  gulp.src(['sources/switcher/css/**/*', 'sources/switcher/lighthtml/lightHtml.css'])
    .pipe(autoprefixer(
      'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'ie 10', 'ie 11', 'opera 12.1', 'ios 6', 'Android 4',
      'iOS 6', 'iOS 7', 'iOS 8'
    ))
    .pipe(concat('flash.css'))
    .pipe(gulpif(gulp.buildMode === 'prod', minifycss()))
    .pipe(gulp.dest(getBuildPath.call(this) + 'css'));

});


// svg sprite
gulp.task('icon', function () {

  return gulp.src('sources/icon/map/**/*')
    .pipe(plumber({
      errorHandler: customErrorHandler
    }))
    .pipe(svgsprite({
      shape: {
        id: {
          generator: 'svgicon-%s'
        },
      },
      mode: {
        symbol: {
          dest: "",
          sprite: "icons.svg",
          prefix: "svgicon-"
        }
      }
    }))
    .pipe(gulp.dest(getBuildPath.call(this) + 'mobile/img/'));

});


/**
 *  JAVASCRIPT
 */
gulp.task('js', ['js-init', 'js-minall', 'js-libraries', 'js-worker', 'js-switcher', 'integration',
  'js-components'
]);

gulp.task('js-init', function () {

  gulp.src([
      // This two files are included while jQuery is not completely removed from the reader
      'sources/switcher/javascript/vendor/jquery-1.11.2.js',
      'sources/switcher/javascript/vendor/tmpl.js',
      // The important files
      'sources/javascript/polyfill/classList.js', 'sources/javascript/polyfill/children.js',
      'sources/javascript/polyfill/matrix.js', 'sources/javascript/polyfill/requestAnimationFrame.js',

      'sources/javascript/init/init.js',
      'sources/javascript/cssManager.js', 'sources/javascript/init/javascriptInit.js',
      'sources/javascript/init/starter.js', 'sources/javascript/init/start.js',
      'sources/javascript/service.js'

    ])
    .pipe(plumber({
      "errorHandler": customErrorHandler
    }))
    .pipe(concat('javascriptInit.js'))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.init()))
    .pipe(gulpif(gulp.buildMode === 'prod', uglify({
      "compress": {
        "drop_debugger": false
      }
    })))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.write('.')))
    .pipe(gulp.dest(getBuildPath.call(this) + 'mobile/js/'));

});

gulp.task('js-minall', function () {

  gulp.src(['sources/javascript/minall/**/*', 'sources/javascript/lightboxManager.js',
      'sources/javascript/pageManager.js', 'sources/javascript/thumbnailListManager.js',
      'sources/javascript/performanceManager.js'
    ])
    .pipe(plumber({
      "errorHandler": customErrorHandler
    }))
    .pipe(concat('minall.js')).pipe(gulp.dest(getBuildPath.call(this) + 'mobile/js/'))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.init()))
    .pipe(gulpif(gulp.buildMode === 'prod', uglify({
      "compress": {
        "drop_debugger": false
      }
    })))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.write('.')))
    .pipe(gulp.dest(getBuildPath.call(this) + 'mobile/js/'));

});

gulp.task('js-libraries', function () {

  gulp.src([
      'sources/javascript/vendor/swiffy_runtime.js',
      'sources/javascript/vendor/swiffy_runtime_7_3.js',
      'sources/javascript/vendor/tween.min.js'
    ])
    .pipe(plumber({
      "errorHandler": customErrorHandler
    }))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.init()))
    .pipe(gulpif(gulp.buildMode === 'prod', uglify({
      "compress": {
        "drop_debugger": false
      }
    })))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.write('.')))
    .pipe(gulp.dest(getBuildPath.call(this) + 'mobile/js/'));

});

gulp.task('js-worker', function () {

  gulp.src(['sources/javascript/workerSearch.js', 'sources/javascript/workerPerf.js'])
    .pipe(plumber({
      "errorHandler": customErrorHandler
    }))
    .pipe(jshint('.jshintrc'))
    .pipe(customJshintReporter(true))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.init()))
    .pipe(gulpif(gulp.buildMode === 'prod', uglify({
      "compress": {
        "drop_debugger": false
      }
    })))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.write('.')))
    .pipe(gulp.dest(getBuildPath.call(this) + 'mobile/js/'));

});

gulp.task('js-components', function () {

  gulp.src('sources/javascript/component/**/*')
    .pipe(plumber({
      "errorHandler": customErrorHandler
    }))
    .pipe(jshint('.jshintrc'))
    .pipe(customJshintReporter(true))
    .pipe(gulp.dest(getBuildPath.call(this) + 'mobile/js/component/'));

});

gulp.task('js-switcher', function () {

  gulp.src([
      'sources/javascript/polyfill/bind.js',
      'sources/javascript/polyfill/promise.js',
      'sources/javascript/polyfill/base64.js',
      'sources/switcher/javascript/init.js',
      'sources/switcher/javascript/utils.js',
      'sources/javascript/init/require.js',
      'sources/javascript/urlManager.js',
      'sources/javascript/userAgentManager.js',
      'sources/javascript/templateManager.js',
      'sources/javascript/xmlManager.js',
      'sources/javascript/startupManager.js',
      'sources/switcher/javascript/switcher.js',
      'sources/switcher/javascript/start.js'
    ])
    .pipe(plumber({
      "errorHandler": customErrorHandler
    }))
    .pipe(concat('globals.js'))
    .pipe(gulpif(
      gulp.buildMode !== 'prod',
      replace("var webpublicationNamespace = ", "var w = webpublicationNamespace = ")
    ))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.init()))
    .pipe(gulpif(gulp.buildMode === 'prod', uglify({
      "compress": {
        "drop_debugger": false
      }
    })))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.write('.')))
    .pipe(gulp.dest(getBuildPath.call(this)));

  gulp.src('sources/switcher/javascript/vendor/jquery-1.11.2.js')
    .pipe(concat('jquery.js'))
    .pipe(gulpif(gulp.buildMode === 'prod', uglify({
      "compress": {
        "drop_debugger": false
      }
    })))
    .pipe(gulp.dest(getBuildPath.call(this)));

  gulp.src('sources/switcher/javascript/vendor/tmpl.js')
    .pipe(gulpif(gulp.buildMode === 'prod', uglify({
      "compress": {
        "drop_debugger": false
      }
    })))
    .pipe(gulp.dest(getBuildPath.call(this)));

  gulp.src('sources/switcher/javascript/flash/piwikEventsTracking.js')
    .pipe(gulpif(gulp.buildMode === 'prod', uglify({
      "compress": {
        "drop_debugger": false
      }
    })))
    .pipe(gulp.dest(getBuildPath.call(this)));

  gulp.src([
      'sources/switcher/javascript/flash/flashFunctions.js',
      'sources/switcher/javascript/flash/swfobject.js',
      'sources/switcher/javascript/flash/flash.js',
      'sources/switcher/lighthtml/lightHtml.js'
    ])
    .pipe(concat('flash.js'))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.init()))
    .pipe(gulpif(gulp.buildMode === 'prod', uglify({
      "compress": {
        "drop_debugger": false
      }
    })))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.write('.')))
    .pipe(gulp.dest(getBuildPath.call(this)));

});

gulp.task('default', ['install'], function () {});

gulp.task('install', ['js', 'css', 'template', 'lightbox', 'integration', 'copy'], function () {});

gulp.task('hint', function () {

  gulp.src([
      'sources/javascript/init/**/*',
      'sources/javascript/minall/**/*',
      'sources/javascript/minall/workerSearch.js',
    ])
    .pipe(jshint('.jshintrc'))
    .pipe(customJshintReporter());

});

// Task to watch every file change
gulp.task('watch', ['install'], function () {

  gulp.watch('sources/**/*.css', ['css']);
  gulp.watch('sources/**/*.scss', ['css']);

  gulp.watch('sources/**/*.js', ['js']);

  gulp.watch('sources/**/*.html', ['template']);

  gulp.watch('sources/switcher/lighthtml/img/*', ['lightbox']);

  gulp.watch('sources/font/**/*', ['copy']);
  gulp.watch('sources/icon/**/*', ['copy']);
  gulp.watch('sources/image/**/*', ['copy']);
  gulp.watch('sources/locale/**/*', ['copy']);
  gulp.watch('sources/template/**/*', ['copy']);
  gulp.watch('sources/tmpl/**/*', ['copy']);

  gulp.watch('sources/integration/**/*', ['integration']);

});

// The watch function, can reload gulpfile.js
gulp.task('watch2', function () {

  var p;

  gulp.watch('gulpfile.js', spawnChildren);
  spawnChildren();

  function spawnChildren(e) {

    if (p) {
      p.kill();
    }

    p = spawn('gulp', [
      'watcher',
      '--env=' + gulp.buildMode,
      '--path=' + gulp.buildPath
    ], {
      stdio: 'inherit'
    });

  }

});

// Build a distribution ready version of the mobile app
gulp.task('dist', function () {

  gulp.buildPath = 'dist';

  gulp.start('js', 'css', 'copy', 'template', 'lightbox', 'integration');

});

// Copy publication mobile files
gulp.task('copy', function () {

  gulp.src('sources/font/**/*')
    .pipe(gulp.dest(getBuildPath.call(this) + 'mobile/fonts/'));

  gulp.src('sources/icon/**/*')
    .pipe(gulp.dest(getBuildPath.call(this) + 'mobile/icons/'));

  gulp.src('sources/image/**/*')
    .pipe(gulp.dest(getBuildPath.call(this) + 'mobile/img/'));

  gulp.src('sources/tmpl/**/*')
    .pipe(gulp.dest(getBuildPath.call(this) + 'mobile/tmpl/'));

  gulp.src('sources/template/**/*')
    .pipe(gulp.dest(getBuildPath.call(this) + 'mobile/template/'));

  gulp.src('sources/locale/**/*')
    .pipe(gulp.dest(getBuildPath.call(this) + 'locale/mobile/'));

});

gulp.task('template', function () {

  gulp.src('sources/switcher/template/flash/**/*')
    .pipe(gulp.dest(getBuildPath.call(this) + 'template/flash/'));

  gulp.src('sources/switcher/template/html/**/*')
    .pipe(gulp.dest(getBuildPath.call(this) + 'template/html/'));

  if (gulp.buildPath === 'dist') {

    gulp.src('sources/switcher/template/index/**/*')
      .pipe(gulp.dest(getBuildPath.call(this, '../') + ''));

  } else {

    var cwd = process.cwd();

    fs.readFile(cwd + "/sources/switcher/template/index/dtd.txt", "utf-8", function (e, dataDtd) {

      fs.readFile(cwd + "/sources/switcher/template/index/open_balise_html.txt", "utf-8", function (e, dataHTML) {

        fs.readFile(cwd + "/sources/switcher/template/index/jsInitETC.txt", "utf-8", function (e, dataJS) {

          gulp.src(['sources/switcher/template/index/index.html'])
            .pipe(replace("[file:{player_location}/default/index/dtd.txt]", dataDtd.trim()))
            .pipe(replace("[file:{player_location}/default/index/open_balise_html.txt]", dataHTML.trim()))
            .pipe(replace("[file:{player_location}/default/index/jsInitETC.txt]", dataJS.trim()))
            .pipe(replace(/\[lng\]/g, 'en'))
            .pipe(replace(/\[title\]/g, 'dev'))
            .pipe(replace(/\[robots_content\]/g, 'noindex,nofollow'))
            .pipe(gulp.dest(getBuildPath.call(this, '../')));

        }.bind(this));

      }.bind(this));

    }.bind(this));

  }

});

gulp.task('lightbox', function () {

  gulp.src('sources/switcher/lighthtml/img/*')
    .pipe(gulp.dest(getBuildPath.call(this) + 'img/'));

});

// Task that generate the wp_integration.js file
// Inclusion of the publication in other pages
gulp.task('integration', function () {

  gulp.src([
      'sources/integration/javascript/init.js',
      'sources/javascript/userAgentManager.js',
      'sources/integration/javascript/integration.js',
    ])
    .pipe(plumber({
      "errorHandler": customErrorHandler
    }))
    .pipe(concat('wp_integration.js'))
    .pipe(gulp.dest(getBuildPath.call(this)))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.init()))
    .pipe(gulpif(gulp.buildMode === 'prod', uglify({
      "compress": {
        "drop_debugger": false
      }
    })))
    .pipe(gulpif(gulp.buildPath !== 'dist', sourcemaps.write('.')))
    .pipe(gulp.dest(getBuildPath.call(this)));

});
