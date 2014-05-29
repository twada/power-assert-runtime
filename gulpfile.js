var gulp = require('gulp'),
    gutil = require('gulp-util'),
    bump = require('gulp-bump'),
    git = require('gulp-git'),
    mocha = require('gulp-mocha'),
    mochaPhantomJS = require('gulp-mocha-phantomjs'),
    connect = require('gulp-connect'),
    clean = require('gulp-clean'),
    runSequence = require('run-sequence'),
    source = require('vinyl-source-stream'),
    through = require('through2'),
    browserify = require('browserify'),
    config = {
        bump: {
            target: ['./bower.json', './package.json']
        },
        bundle: {
            standalone: 'empower',
            srcFile: './lib/empower.js',
            destDir: './build',
            destName: 'empower.js'
        },
        coverage: {
            filename: 'coverage.lcov'
        },
        test: {
            base: './test/',
            pattern: '**/*_test.js',
            amd: 'test/test-amd.html',
            browser: 'test/test-browser.html'
        }
    };

function captureStdout (filespec) {
    var orig, log = '';
    function spy (str) {
        log += str;
    }
    function pass (file, encoding, callback) {
        this.push(file);
        callback();
    }
    return {
        start: through.obj(pass, function (callback) {
            orig = process.stdout.write;
            process.stdout.write = spy;
            callback();
        }),
        finish: through.obj(pass, function (callback) {
            var file = new gutil.File(filespec);
            file.contents = new Buffer(log);
            this.push(file);
            process.stdout.write = orig;
            log = '';
            orig = null;
            callback();
        })
    };
}

function runMochaWithBlanket() {
    var blanket = require('./coverage/blanket'),
        capt = captureStdout({
            cwd: __dirname,
            base: __dirname,
            path: __dirname + '/' + config.coverage.filename
        });
    return gulp
        .src(config.test.base + config.test.pattern, {read: false})
        .pipe(capt.start)
        .pipe(mocha({
            ui: 'tdd',
            reporter: 'mocha-lcov-reporter'
        }))
        .pipe(capt.finish)
        .pipe(gulp.dest('.'))
        .on('error', gutil.log);
}

function runMochaSimply() {
    return gulp
        .src(config.test.base + config.test.pattern, {read: false})
        .pipe(mocha({
            ui: 'tdd',
            reporter: 'dot'
        }))
        .on('error', gutil.log);
}

function bumpVersion(options) {
    return gulp
        .src(config.bump.target)
        .pipe(bump(options))
        .pipe(gulp.dest('./'));
}

gulp.task('git_add', function(){
    return gulp
        .src(config.bump.target)
        .pipe(git.add());
});

gulp.task('git_commit', function(){
    var pkg = require('./package.json');
    return gulp
        .src(config.bump.target)
        .pipe(git.commit(pkg.version));
});

gulp.task('git_tag', function(done) {
    var pkg = require('./package.json');
    git.tag('v' + pkg.version, pkg.version, null, done);
});

['patch', 'minor', 'major'].forEach(function (v) {
    gulp.task('bump_' + v, function(){
        return bumpVersion({type: v});
    });
    gulp.task('release_' + v, function(){
        runSequence(
            'bump_' + v,
            'git_add',
            'git_commit',
            'git_tag'
        );
    });
});

gulp.task('connect', function() {
    connect.server({
        root: [__dirname],
        port: 9001,
        keepalive: true
    });
});

gulp.task('watch', function () {
    gulp.watch('{lib,test}/**/*.js', runMochaSimply);
    runMochaSimply();
});

gulp.task('clean_bundle', function () {
    return gulp
        .src(config.bundle.destDir, {read: false})
        .pipe(clean());
});

gulp.task('clean_coverage', function () {
    return gulp
        .src(config.coverage.filename, {read: false})
        .pipe(clean());
});

gulp.task('bundle', function() {
    var bundleStream = browserify(config.bundle.srcFile).bundle({standalone: config.bundle.standalone});
    return bundleStream
        .pipe(source(config.bundle.destName))
        .pipe(gulp.dest(config.bundle.destDir));
})

gulp.task('unit', function () {
    return runMochaSimply();
});

gulp.task('coverage', function () {
    return runMochaWithBlanket();
});

gulp.task('test_amd', function () {
    return gulp
        .src(config.test.amd)
        .pipe(mochaPhantomJS({reporter: 'dot'}));
});

gulp.task('test_browser', function () {
    return gulp
        .src(config.test.browser)
        .pipe(mochaPhantomJS({reporter: 'dot'}));
});

gulp.task('test', function() {
    runSequence(
        ['clean'],
        ['bundle'],
        ['unit','test_browser','test_amd']
    );
});

gulp.task('clean', ['clean_coverage', 'clean_bundle']);
