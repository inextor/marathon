/*
	node ./node_modules/gulp/bin/gulp.js
*/
var gulp			= require('gulp');

function css_task(cb)
{
	console.log('css_task');
	gulp.src([
		'./css/*.css'])
    //.pipe(cleanCSS({}))
    .pipe(gulp.dest('dist/css'));

	cb();
}

function index_task(cb)
{
	gulp.src(['./index.html','./manifest.webmanifest']).pipe(gulp.dest('dist/'));
	cb();
}

function scripts_task(cb)
{
	gulp.src(['./node_modules/sauna-spa/css/*.css']).pipe(gulp.dest('dist/Sauna/css/'));
	gulp.src(['./node_modules/sauna-spa/js/*.js']).pipe(gulp.dest('dist/Sauna/js/'));
	gulp.src(['./node_modules/db-finger/*.js']).pipe(gulp.dest('dist/Finger/'));
	gulp.src(['./node_modules/promiseutil/PromiseUtils.js']).pipe(gulp.dest('dist/PromiseUtils/'));
	gulp.src(['./node_modules/diabetes/Util.js']).pipe(gulp.dest('dist/Diabetes/'));
	gulp.src(['./js/*.js']).pipe( gulp.dest('dist/js/') );

	cb();
}


function watch_task(cb)
{
	console.log('watch');
	gulp.watch([
			'./index.html',
			'./css/*.css',
			'./js/*.js',
			'./ants.webmanifest',
			'./node_modules/db-finger/*.js',
			'./node_modules/sauna-spa/js/*.js',
			'./node_modules/sauna-spa/css/*.css',
			'./node_modules/promiseutil/PromiseUtils.js',
      		'./node_modules/db-finger/DatabaseStore.js',
      		'./node_modules/diabetes/Util.js'],gulp.parallel('scripts_task','css_task','index_task'));

	cb();
}

gulp.task('css_task',css_task);
gulp.task('scripts_task', scripts_task );
gulp.task('index_task', index_task);

gulp.task('build',gulp.parallel('scripts_task','css_task','index_task'));

exports.default = gulp.series( 'build', watch_task );
