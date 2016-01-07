var gulp = require('gulp');
// 用来将HTML 文件中（或者templates/views）中没有优化的script 和stylesheets 替换为优化过的版本。
var usemin = require('gulp-usemin');
// javascript代码优化工具，可以解析，压缩和美化javascript。
var uglify = require('gulp-uglify');
// 合并压缩html
var minifyHtml = require('gulp-minify-html');
// 合并css
var minifyCss = require('gulp-minify-css');
// 加上哈希文件名
var rev = require('gulp-rev');
// 提示消息
var notify = require('gulp-notify');
// 清理目录
var clean = require('gulp-clean');
// JavaScript检查
var jshint = require('gulp-jshint');
// 文件引入
var fileInclude = require('gulp-file-include');
// 配置文件
var config = require('./gulpConfig.json');
// 文本替换
var replace = require('gulp-replace');
// 重命名
var rename = require('gulp-rename');
// 合并文件
var concat = require('gulp-concat');
// gulp-exec
var exec = require('gulp-exec');

/**
 * 清理build目录
 */
gulp.task('cleanBuild', function () {
    return gulp.src(config['dest'])
        .pipe(clean());
});

/**
 * 替换模板
 */
gulp.task('includeTemplate', ['cleanBuild'], function () {
    var htmlArr = [];
    htmlArr.push('<script type="text/ng-template" id="$1">');
    htmlArr.push('\n<!--include(\'$1\')-->\n');
    htmlArr.push('</script>');
    return gulp.src(config['src'] + '**/*.*')
        .pipe(replace(/<!\-\-\s*templateUrl\(\s*['"]\s*([^'"]+)\s*['"]\s*\)\s*\-\->/ig, htmlArr.join('')))
        .pipe(fileInclude({
            prefix: '<!--',
            suffix: '-->'
        }))
        .pipe(gulp.dest(config['tempPath']));
});

/**
 * 整理代码(合并压缩)
 */
gulp.task('usemin', ['includeTemplate'], function () {
    return gulp.src(config['tempPath'] + 'index.html')
        .pipe(usemin({
            cssVendor: [minifyCss(), 'concat', rev()],
            cssMain: [minifyCss(), 'concat', rev()],
            html: [minifyHtml({empty: true})],
            // 不可压缩，ionic有特殊处理
            jsVendor: [rev()],
            jsMain: [uglify(), rev()]
        }))
        .pipe(gulp.dest(config['dest']));
});

/**
 * 复制css&font到build目录
 */
gulp.task('copyCssFonts', ['usemin'], function () {
    return gulp.src([
        config['tempPath'] + 'img*/**/**.*',
        config['tempPath'] + 'lib/ionicons/fonts*/**.*'])
        .pipe(gulp.dest(config['dest']));
});

/**
 * 清理临时目录
 */
gulp.task('cleanTemp', ['copyCssFonts'], function () {
    return gulp.src(config['tempPath'])
        .pipe(clean());
});

/**
 * 打包到Android目录
 */
gulp.task('buildZip', ['cleanTemp'], function () {
    setTimeout(function () {
        console.log('开始压缩zip到Android目录下');
        return gulp.src('./')
            .pipe(exec('winrar a ' + config['androidZipPath'] + 'h5.zip H5', {
                continueOnError: false,
                pipeStdout: false,
                customTemplatingThing: 'test'
            }))
            .pipe(exec.reporter({
                err: true,
                stderr: true,
                stdout: true
            }))
    }, 1000);
});

gulp.task('default', ['buildZip']);