'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    htmlmin = require('gulp-htmlmin'),
    prefixer = require('gulp-autoprefixer'),
    less = require('gulp-less'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    spritesmith = require('gulp.spritesmith'),
    pngquant = require('imagemin-pngquant'),
    gulpif = require('gulp-if'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html: '_src/*.html',
        js: '_src/js/main.js',
        style: '_src/style/main.less',
        img: '_src/img/**/*.*',
        sprite: '_src/sprite/*.*',
        fonts: '_src/fonts/**/*.*'
    },
    watch: {
        html: '_src/**/*.html',
        js: '_src/js/**/*.js',
        style: '_src/style/**/*.less',
        img: '_src/img/**/*.*',
        sprite: '_src/sprite/*.*',
        fonts: '_src/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "front_dev",
    open: false
};

var production = false;
for (var i = 0; i < process.argv.length; i++) {
    if (process.argv[i] == '-p') {
        production = true
        console.log('<Production build>')
    } 
}

var htmlminOpts = {
    collapseWhitespace: true,
    removeComments: true
}
gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulpif(production, htmlmin(htmlminOpts)))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        // .pipe(sourcemaps.init())
        .pipe(gulpif(production, uglify()))
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
        // .pipe(sourcemaps.init())
        .pipe(less())
        .on('error', errorLog)
        .pipe(prefixer())
        .pipe(gulpif(production, cssmin()))
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

// по команде, вне вотча
gulp.task('sprite:build', function() {
    var spriteData = gulp.src(path.src.sprite).pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.css',
        imgPath: '../img/sprite.png',
        padding: 1,
        algorithm: 'left-right'
    }));
    spriteData.img.pipe(gulp.dest('_src/img/')).pipe(reload({stream: true}));
    spriteData.css.pipe(gulp.dest('_src/style/partials/')).pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(gulpif(production, imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        })))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('build', [
    'fonts:build',
    // 'sprite:build',
    'image:build',
    'html:build',
    'js:build',
    'style:build'
]);

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    // watch([path.watch.sprite], function(event, cb) {
    //     gulp.start('sprite:build');
    // });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('default', ['build', 'webserver', 'watch']);

function errorLog(error) {
    var filename = error.filename;
    filename = filename.slice(filename.lastIndexOf('\\') + 1);
    console.log('Error in', filename+':'+error.line);
    this.emit('end');
}