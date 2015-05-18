var gulp = require('gulp');
var path = require('path');
var fs = require('fs');

// Plugins
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var wrapper = require('gulp-wrapper');
var replace = require('gulp-replace');
var webserver = require('gulp-webserver');


/**
 * [projectConfig 项目设置]
 */
var projectConfig = {
    // 项目名称
    name: 'seajsTest',
    // 项目开发者
    author: 'zuoshilong@jd.com',
    // 是否自动发布
    isAutoRelease: true,
    // 发布路径
    releasePath: 'finance/test/baitiao/process/1.0.0',
    // 是否自动补全 CDN路径
    isAutoPrefixCDN: true,
    // CDN路径
    cdnPath: 'http://static.360buyimg.com/'
};

/**
 * [projectUtil 工具类]
 */
var projectUtil = {
    // 格式化路径
    fomartPath: function(pathStr) {
        return pathStr.replace(/\\/g, '\/');
    },
    // 获取当前目录
    getCurrentDir: function() {
        return fs.realpathSync('./');
    },
    // 获取svn根目录
    getSvnRoot: function() {
        var currentDir = this.getCurrentDir();
        var svnRoot = currentDir.replace(/static\S*/g, '');
        svnRoot = this.fomartPath(svnRoot);
        return svnRoot;
    },
    // 获取发布目录
    getReleasePath: function() {
        var svnRoot = this.getSvnRoot();
        var releasePath = projectConfig.releasePath;
        var targetPath = path.join(svnRoot, 'release', releasePath);
        return targetPath;
    },
    // 获取CDN全部路径
    getCDNpath: function() {
        var cdnPath = projectConfig.cdnPath + projectConfig.releasePath;
        return cdnPath;
    },
    // 获取当前时间
    getNowDate: function() {
        var nowDate = new Date();
        now = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate() + ' ' + nowDate.getHours() + ':' + nowDate.getMinutes() + ':' + nowDate.getMinutes();
        return now;
    },
    // 删除文件夹
    deleteDir: function(path) {
        var _this = this;
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function(file, index) {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    _this.deleteDir(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }
};

/**
 * 单步任务
 */
// sass & minifyCSS
gulp.task('sass', function() {
    gulp.src([
            'css/**/*.scss',
            '!css/**/_*.scss'
        ])
        .pipe(sass({
            includePaths: ['css']
        }))
        // .pipe(minifyCSS())
        .pipe(replace(/url\(i/g, 'url(' + project.cdnPath))
        .pipe(wrapper({
            header: '/* @update: ' + projectUtil.getNowDate() + ' */ \n'
        }))
        .pipe(gulp.dest('build/css'))
        // .pipe(gulp.dest(projectUtil.getReleasePath() + '/css'));
});

// css
gulp.task('css', function() {
    gulp.src([
            'css/**/*.css',
            '!css/**/*.min.css'
        ])
        .pipe(minifyCSS({
            compatibility: 'ie7'
        }))
        // .pipe(replace(/url\(i/g, 'url('+ project.cdnPath))
        .pipe(wrapper({
            header: '/* @update: ' + projectUtil.getNowDate() + ' */ \n'
        }))
        .pipe(gulp.dest('build/css'))
        // .pipe(gulp.dest(projectUtil.getReleasePath() + '/css'));
});

// uglify javascript
gulp.task('js', function() {
    gulp.src([
            'js/**/*.js'
        ])
        .pipe(uglify({
            mangle: {
                except: ['jQuery', '$', 'require']
            },
            output: {
                ascii_only: true
            }
        }))
        .pipe(wrapper({
            header: '/* @update: ' + projectUtil.getNowDate() + ' */ \n'
        }))
        .pipe(gulp.dest('build/js'))
        // .pipe(gulp.dest(projectUtil.getReleasePath() + '/js'));
});

// html
gulp.task('html', function() {
    gulp.src([
            'html/**/*.html',
            'html/**/*.htm'
        ])
        // .pipe(minifyCSS())
        .pipe(replace(/href="..\/css/g, 'href="' + projectUtil.getCDNpath() + '/css'))
        .pipe(replace(/src="..\/js/g, 'src="' + projectUtil.getCDNpath() + '/js'))
        .pipe(gulp.dest('build/html'))
        // .pipe(gulp.dest(projectUtil.getReleasePath() + '/css'));
});

gulp.task('moveFiles', function() {
    gulp.src([
            'css/i/*.png',
            'css/i/*.jpg',
            'css/i/*.gif'
        ])
        .pipe(gulp.dest('build/css/i'));
    // .pipe(gulp.dest(project.releaseTarget() + '/js'));
    gulp.src([
            'css/sprite/*.png',
            'css/sprite/*.jpg',
            'css/sprite/*.gif'
        ])
        .pipe(gulp.dest('build/css/sprite'));
});

gulp.task('refresh', function() {
    gulp.src([
            '**/*.html',
            '**/*.php'
        ])
        .pipe(refresh(server));
});


// 删除build 文件夹
gulp.task('deleteBuild', function() {
    projectUtil.deleteDir('build');
});

// 发布到发布目录
gulp.task('releaseBuild', function() {
    // 删除发布目录
    projectUtil.deleteDir(projectUtil.getReleasePath());
    // 复制build至 发布目录
    gulp.src([
        'build/css/**/*.*'
    ]).pipe(gulp.dest(projectUtil.getReleasePath() + '/css'));
    gulp.src([
        'build/js/**/*.*'
    ]).pipe(gulp.dest(projectUtil.getReleasePath() + '/js'));
    gulp.src([
        'build/images/*.*'
    ]).pipe(gulp.dest(projectUtil.getReleasePath() + '/images'));
});


// task build 打包流程
gulp.task('build', function() {
    gulp.run(['deleteBuild', 'css', 'js', 'moveFiles', 'html']);
});

// task release 发布流程
gulp.task('release', function() {
    gulp.run(['releaseBuild']);
});

// test
gulp.task('test', function() {
    console.log(path.join(project.cdnPath, project.releasePath));
});


var browserSync = require('browser-sync');

// Static server
gulp.task('server', function() {
    var files = [
        'html/**/*.html',
        'html/**/*.htm',
        'css/**/*.css',
        'css/i/*.*',
        'js/**/*.js'
    ];
    browserSync.init(files, {
        server: {
            baseDir: './',
            directory: true
        }
    });
});