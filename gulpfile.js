var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var prefix = require('gulp-autoprefixer');
var cp = require('child_process');
var webpack = require('gulp-webpack');

var jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

var paths = {
    sass_dir: 'assets/sass',
    sass_main: 'assets/sass/main.scss',
    css_dir: 'assets/css',
    js_main: 'assets/js/app.js',
    base_dir: '_site',
    globs: {
        sass: [
            './assets/sass/**/*.scss',
            './assets/sass/**/*.sass'
        ],
        content: [
            '**/*.html',
            '**/*.md',
            '**/*.markdown',
            'assets/**/*.js',
            '!_site',
            '!_site/**/*',
        ],
        js: 'assets/js/**/*.js'
    }
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', ['assets'], function (done) {
    browserSync.notify({ jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build' });
    return cp.spawn(jekyll, ['build'], { stdio: 'inherit' })
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['jekyll-build'], function () {
    browserSync({ server: { baseDir: paths.base_dir } });
});

/*
 * Group all assets tasks
 */
gulp.task('assets', ['sass', 'scripts', 'fonts']);

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src(paths.sass_main)
        .pipe(plumber())
        .pipe(sass({ includePaths: paths.sass_dir, onError: browserSync.notify }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest(paths.base_dir + '/' + paths.css_dir))
        .pipe(gulp.dest('dist/css/'))
        .pipe(browserSync.reload({ stream: true }))
});

gulp.task('scripts', function () {
    return gulp.src(paths.js_main)
        .pipe(webpack({ output: { filename: 'bundle.js' } }))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.reload({ stream: true }))
});

gulp.task('fonts', function () {
    return gulp.src('assets/fonts/')
        .pipe(gulp.dest('dist/fonts/'))
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch(paths.globs.sass, ['jekyll-rebuild']);
    gulp.watch(paths.globs.js, ['jekyll-rebuild']);
    gulp.watch(paths.globs.content, ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);