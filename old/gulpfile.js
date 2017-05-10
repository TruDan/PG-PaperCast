/**
 * Created by truda on 09/05/2017.
 */
var gulp        = require('gulp');
require('gulp-stats')(gulp);

var fs = require('fs');
var jsStringEscape = require('js-string-escape');

var util = require('gulp-util');
var plugins     = require('gulp-load-plugins')();
var mainBowerFiles = require('main-bower-files');
var del         = require('del');
var es          = require('event-stream');

var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');
var es6transpiler = require('gulp-es6-transpiler');

// == PATH STRINGS ========

var paths = {

    modules: {
        core: {
            src: "./src/www",
            dist: "/www",
            app: "PaperCast"
        }
    },

    srcLibraries: ['../JS-PikaCore/build/**/*', './src/assets/img/**/*'],

    srcIndex: '/index.html',
    srcScripts: '/app/**/*.js',
    srcPartials: '/views/**/*.html',

    srcStyles: './src/www/styles/**/*.scss',

    srcLib: './lib',

    distScripts: '/scripts',
    distStyles: '/www/css',
    distImages: '/www/img',

    distProd: './dist',
    distDev: './build',

    bowerDir: "./bower_components"
};

var errorHandler = function(error) {
    console.log("Error: " + error.toString());
    this.emit('end');
};

var isProd = !!util.env.production;
var prodOnly = function(fn) {
    return isProd ? fn() : util.noop();
};

var distBase = isProd ? paths.distProd : paths.distDev;

// == PIPE SEGMENTS ========

var pipes = {};

pipes.orderedAppScripts = function() {
    return plugins.angularFilesort().on('error', errorHandler);
};

pipes.minifiedFileName = function() {
    return plugins.rename(isProd ? function (path) {
        path.extname = '.min' + path.extname;
    } : util.noop());
};

//   == CORE PIPE SEGMENTS ========

pipes.scriptedPartials = function(module) {
    return gulp.src(module.src + paths.srcPartials).on('error', errorHandler)
    //.pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(plugins.ngTemplates({
            module: module.app,
            standalone: false
        })).on('error', errorHandler);
};

pipes.buildStyles = function() {
    return gulp.src(paths.srcStyles).on('error', errorHandler)
        .pipe(plugins.sass({
            style: isProd ? 'compressed' : 'nested',
            debug: true,
            includePaths: [
                paths.srcStyles,
                paths.bowerDir
            ]
        })).on('error', errorHandler)
        .pipe(prodOnly(plugins.minifyCss)).on('error', errorHandler)
        .pipe(pipes.minifiedFileName())
        .pipe(gulp.dest(distBase + paths.distStyles));
};

pipes.buildScripts = function(module) {
    var partials = pipes.scriptedPartials(module);
    var scripts = gulp.src(module.src + paths.srcScripts)
        .pipe(es6transpiler({
            "environments": ["node","browser"],
            globals: {
                angular: false,
                PIXI: false,
                EventEmitter: false
            }
        })).on('error', errorHandler);

    return es.merge(partials, scripts)
        .pipe(pipes.orderedAppScripts()).on('error', errorHandler)
        .pipe(plugins.replace(/<link href=\\?"(.*)\.css\\?"[^>]*>/g, function(s, filename) {
            var style = jsStringEscape(fs.readFileSync(distBase + paths.distStyles + "\\" + filename + (isProd ? '.min.css' : '.css'), 'utf8'));
            return style;
        }))
        .pipe(plugins.concat(module.app.toLowerCase() + ".js")).on('error', errorHandler)
        .pipe(plugins.ngAnnotate()).on('error', errorHandler)

        .pipe(prodOnly(plugins.uglify)).on('error', errorHandler)
        .pipe(pipes.minifiedFileName())
        .pipe(gulp.dest(distBase + module.dist + paths.distScripts));
};

pipes.buildIndex = function(module) {
    var scripts  = gulp.src([distBase + paths.modules.core.dist + paths.distScripts + "/**/*.js", distBase + module.dist + paths.distScripts + "/**/*.js", "!" + distBase + paths.modules.core.dist + paths.distScripts + "/vendor*.js"]).on('error', errorHandler).pipe(pipes.orderedAppScripts());
    var styles  = gulp.src([distBase + paths.distStyles + "/**/*", "!" + distBase + paths.distStyles + "/theme*.css"], {read: false}).on('error', errorHandler);

    var bower = gulp.src(distBase + paths.modules.core.dist + paths.distScripts + "/vendor*.js");

    return gulp.src(module.src + paths.srcIndex).on('error', errorHandler)
        .pipe(gulp.dest(distBase + module.dist))
        .pipe(plugins.inject(bower, {relative: true, name: "bower"})).on('error', errorHandler)
        .pipe(plugins.inject(scripts, {relative: true})).on('error', errorHandler)
        .pipe(plugins.inject(styles, {relative: true})).on('error', errorHandler)
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true})).on('error', errorHandler)
        .pipe(gulp.dest(distBase + module.dist));

};

pipes.buildModule = function(module) {
    console.log("Building module ", module);
    return es.merge(
        pipes.buildScripts(module)
    ).on('error', errorHandler)
        .pipe(es.wait(function(err, body) { pipes.buildIndex(module); console.log("Completed ", module); }));
};

pipes.copyImages = function() {
    return gulp.src(paths.srcLib + "/**/*.{png,svg,jpg}").on('error', errorHandler)
    // .pipe(cache('coreImages'))
        .pipe(gulp.dest(distBase + paths.distImages));
};
pipes.copyLibraryCss = function() {
    return gulp.src(paths.srcLib + "/**/*.css").on('error', errorHandler)
    // .pipe(cache('coreImages'))
        .pipe(gulp.dest(distBase + paths.distStyles));
};

pipes.compressVendorScripts = function() {
    return gulp.src(mainBowerFiles({
        debugging: true,
        paths: {
            bowerDirectory: paths.bowerDir,
            //bowerrc: "./.bowerrc",
            bowerJson: "./bower.json"
        },
        filter: "**/*.js"
    }))
     //.pipe(pipes.orderedAppScripts())
        .pipe(plugins.concat('vendor.js'))
            .pipe(prodOnly(plugins.uglify)).on('error', errorHandler)
            .pipe(pipes.minifiedFileName())
            .pipe(gulp.dest(distBase + paths.modules.core.dist + paths.distScripts));
};

pipes.copyLibraryScripts = function() {
    return gulp.src(paths.srcLib + "/**/*.js")
        .pipe(prodOnly(plugins.uglify)).on('error', errorHandler)
        .pipe(pipes.minifiedFileName())
        .pipe(gulp.dest(distBase + paths.modules.core.dist + paths.distScripts));
};

// == TASKS ========
pipes.cleanDistDev = function() {
    return gulp.src(paths.distDev, {read: false})
        .pipe(plugins.clean());
};

pipes.cleanDistProd = function() {
    return gulp.src(paths.distProd, {read: false})
        .pipe(plugins.clean());
};

pipes.cleanDist = function() {
    return isProd ? pipes.cleanDistProd() : pipes.cleanDistDev();
};

pipes.buildAssets = function() {
    return es.merge(pipes.buildStyles(), pipes.copyImages()).on('error', errorHandler);
};

pipes.buildVendor = function() {
    return es.merge(pipes.compressVendorScripts(), pipes.copyLibraryScripts(), pipes.copyLibraryCss()).on('error', errorHandler);
};

pipes.buildResources = function() {
    return es.merge(pipes.buildAssets(), pipes.buildVendor()).on('error', errorHandler);
};

pipes.cleanLib = function() {
    return gulp.src(paths.srcLib)
        .pipe(plugins.clean());
};

pipes.updateLib = function() {
    return gulp.src(paths.srcLibraries)
        .pipe(gulp.dest(paths.srcLib));
};

gulp.task('clean-dev', pipes.cleanDistDev);
gulp.task('clean-prod', pipes.cleanDistProd);
gulp.task('clean', pipes.cleanDist);

gulp.task('clean-all', ['clean-dev', 'clean-prod']);

gulp.task('clean-lib', pipes.cleanLib);
gulp.task('update-lib', ['clean-lib'], pipes.updateLib);

gulp.task('build-module', function() { return pipes.buildModule(paths.modules.core); });

gulp.task('build-assets', pipes.buildAssets);
gulp.task('build-vendor', pipes.buildVendor);

gulp.task('build-resources', ['update-lib'], pipes.buildResources);

gulp.task('build-all', ['build-resources'], function() { return pipes.buildModule(paths.modules.core); });


gulp.task('clean-build', ['clean'], function() {
    gulp.start('build-all');
});

// == LIVE DEV ========
gulp.task('watch-lib', function() {
    gulp.watch(paths.srcLibraries, ['update-lib']);
});

gulp.task('live', ['clean-build'], function() {

    browserSync.use(browserSyncSpa({
        selector: '[ng-app]'
    }));

    var module = paths.modules.core;

    gulp.watch(module.src + paths.srcScripts, function(event) {
        if (event.type === 'changed') {
            pipes.buildModule(module).on('error', errorHandler).pipe(browserSync.stream());
        }
    });

    gulp.watch(paths.srcStyles, function(event) {
        if (event.type === 'changed') {
            pipes.buildStyles().on('error', errorHandler).pipe(browserSync.stream());
        }
    });

    gulp.watch(module.src + paths.srcPartials, function(event) {
        browserSync.reload(event.path);
    });

    gulp.watch([module.src + '/*.html', 'bower.json'], function(event) {
        pipes.buildModule(module).on('error', errorHandler).pipe(browserSync.stream());
    });

    gulp.watch(paths.srcLibraries, ['build-resources']);

    browserSync.init({
        server: {
            baseDir: [distBase + "/www"],
            routes: {
                '/src': 'src'
            }
        },
        startPath: '/',
        open: false
    });
});

gulp.task('default', ['clean-build']);