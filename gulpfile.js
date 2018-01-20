var gulp = require('gulp'),                        // Сообственно Gulp JS
  browserSync = require('browser-sync').create(),  // Вебсервер - Browsersync
  reload = browserSync.reload,
  csso = require('gulp-csso'),                     // Минификация CSS
  imagemin = require('gulp-imagemin'),             // Минификация изображений
  uglify = require('gulp-uglify'),                 // Минификация JS
  concat = require('gulp-concat'),                 // Склейка файлов
  clean = require('gulp-clean'),                   // Очистка директорий
  postcss = require('gulp-postcss'),               // Пост процессор CSS
  plumber = require('gulp-plumber'),               // Вывод ошибок
  sourcemaps = require('gulp-sourcemaps'),         // Генерация sourcemaps
  zopfli = require("gulp-zopfli");


/*
sudo npm install gulp -g
npm init
npm install
gulp watch
*/
var processors = [
 ];

// Собираем CSS
gulp.task('css', function() {
  return gulp.src('./assets/css/**/*.css').pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(csso())
    .pipe(concat('main.css'))
    .pipe(sourcemaps.write('map'))
    .pipe(gulp.dest('./public/css/')) // записываем css
    .pipe(reload({stream:true})); // даем команду на перезагрузку css
});

// Собираем html
gulp.task('html', function() {
  return gulp.src(['./assets/html/**/*.html', '!./assets/html/**/_*.html']).pipe(plumber())
    .pipe(gulp.dest('./public/')) // Записываем собранные файлы
    .pipe(reload({stream:true})); // даем команду на перезагрузку страницы
});

// Собираем JS
gulp.task('js', function() {
  return gulp.src(['./assets/js/**/*.js', '!./assets/js/vendor/**/*.js']).pipe(plumber())
    .pipe(concat('main.js')) // Собираем все JS, кроме тех которые находятся в ./assets/js/vendor/**
    .pipe(gulp.dest('./public/js'))
    .pipe(reload({stream:true})); // даем команду на перезагрузку страницы
});
// Собираем JS:vendor
gulp.task('js:vendor', function() {
  return gulp.src(['./assets/js/vendor/**/*.js']).pipe(plumber())
    .pipe(gulp.dest('./public/js'))
    .pipe(reload({stream:true})); // даем команду на перезагрузку страницы
});

// Копируем и минимизируем изображения
gulp.task('images', function() {
  return gulp.src('./assets/images/**/*').pipe(plumber())
    .pipe(gulp.dest('./public/images'))
    .pipe(reload({stream:true}));
});

// Очистка директорий - ТОЛЬКО ДЛЯ build
gulp.task('clean:build', function () {
  return gulp.src('./build/*', {read: false})
    .pipe(clean());
});
// Очистка директорий - ТОЛЬКО ДЛЯ public
gulp.task('clean:public', function () {
  return gulp.src('./public/*', {read: false})
    .pipe(clean());
});

// Локальный сервер для разработки
gulp.task('browser-sync', function(cb) {
  browserSync.init({
    server: {
      baseDir: "./public"
    },
    // tunnel: true,
    host: 'localhost',
    port: 9080,
  });
  cb()
});

gulp.task('reloader', function(cb) {
  // CSS
  gulp.watch('assets/css/**/*',
    gulp.series('css'));
  // HTML
  gulp.watch('assets/html/**/*',
    gulp.series('html'));
  // IMAGE
  gulp.watch('assets/images/**/*',
    gulp.series('images'));
  // JS
  gulp.watch(['./assets/js/**/*.js', '!./assets/js/vendor/**/*.js'],
    gulp.series('js'));
  // VENDOR COPY
  gulp.watch('./assets/js/vendor/**/*.js',
    gulp.series('js:vendor'));
});

// Запуск веб сервера & Предварительная сборка проекта
gulp.task(
  'watch',
  gulp.series(
    'clean:public',
    gulp.parallel('css', 'html', 'images', 'js', 'js:vendor'),
    'browser-sync',
    'reloader' // Перезагружает изменения
  )
);

// Сборка проекта gulp build
gulp.task('build', gulp.series('clean:build', function(cb) {
  // html
  gulp.src(['./assets/html/**/*']).pipe(plumber())
    .pipe(gulp.dest('./build/'))
    .pipe(zopfli())
    .pipe(gulp.dest('./build/'))

  // css
  gulp.src('./assets/css/**/*.css').pipe(plumber())
    .pipe(postcss(processors))
    .pipe(csso()) // минимизируем css
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./build/css/')) // записываем css
    .pipe(zopfli())
    .pipe(gulp.dest('./build/css/')) // записываем css

  // js
  gulp.src(['./assets/js/**/*.js', '!./assets/js/vendor/**/*.js']).pipe(plumber())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'))
    .pipe(zopfli())
    .pipe(gulp.dest('./build/js'));

  gulp.src(['./assets/js/vendor/**/*.js']).pipe(plumber())
    .pipe(gulp.dest('./build/js'))
    .pipe(zopfli())
    .pipe(gulp.dest('./public/js'))

  // image
  gulp.src('./assets/images/**/*').pipe(plumber())
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest('./build/images'))
  cb()
}));
