var gulp = require('gulp');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
let babel = require('gulp-babel');

gulp.task('css', () => {
    return gulp.src('./scss/*.scss')
        .pipe(sass({
                outputStyle: process.env.NODE_ENV == 'production' ? 'compressed' : 'expanded'
            })
            .on('error', sass.logError))
        .pipe(sourcemaps.init())
        .pipe(postcss([autoprefixer({
            browsers: ['last 2 versions']
        })]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream({
            match: '**/*.css'
        }));
});

gulp.task('templates', () => {
    return gulp.src([
            'templates/**/*.html'
        ])
        .pipe(gulp.dest('dist'));
});

gulp.task('move', ['minify'], () => {
    return gulp.src([
            'dist/js/service-worker.js',
            'dist/js/sw.js'
        ])
        .pipe(gulp.dest('dist'));
});

gulp.task('minify', () => {
    return gulp.src('js/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('js', ['move'], () => {
    return del([
        'dist/js/service-worker.js',
    ]);
});

gulp.task('js:watch', () => {
    return gulp.watch('./js/**/*.js', ['js']);
});

gulp.task('css:watch', () => {
    return gulp.watch('./scss/**/*.scss', ['css']);
});

gulp.task('templates:watch', () => {
    return gulp.watch('./templates/**/*.html', ['templates', browserSync.reload]);
});

gulp.task('build', ['css', 'js', 'templates']);

gulp.task('default', ['build', 'js:watch', 'css:watch', 'templates:watch'], () => {              
    browserSync.init({
        server: {
            baseDir: ['./dist/', './img/']
        },
        port: 4000
    });
});