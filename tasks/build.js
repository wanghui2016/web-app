
const webpack = require('webpack')
const webpackConfig = require('./webpack.config.js')

const gulp = require('gulp')
const gutil = require('gulp-util')
const source = require('vinyl-source-stream')
const path = require('path')
const jetpack = require('fs-jetpack')


const utils = require('./utils')

const src = './app'
const dest = './build'

const projectDir = jetpack
const srcDir = projectDir.cwd(src)
const destDir = projectDir.cwd(dest)

const filesToCopy = [
    './app/index.html',
    './app/appmenu/**/*',
    './app/background.js',
    './app/src/**/*',
    './app/vendor/**/*',
    './app/ffmpeg-lib-node/**/*',
    './app/node_modules/**/*',
]

// Make a dev copy of the config w/ source maps and debug enabled
const devConfig = Object.create(webpackConfig)
devConfig.devtool = 'source-map'
devConfig.debug = true

gulp.task('clean', function() {
    return jetpack.cwd(dest).dir('.', { empty: true })
})

gulp.task('copy', function() {
    return gulp.src(filesToCopy, { base: 'app' })
        .pipe(gulp.dest(dest))
})

gulp.task('webpack:build-dev', function(callback) {
    return webpack(devConfig, function(err, stats) {
        gutil.log('[webpack:build-dev]', stats.toString({ colors: true }))
        callback()
    })
})

gulp.task('finalize', ['clean'], function () {
  const manifest = srcDir.read('package.json', 'json')
  switch (utils.getEnvName()) {
      case 'development':
          // Add 'dev' suffix to name, so Electron will write all
          // data like cookies and localStorage into separate place.
          manifest.name += '-dev'
          manifest.productName += ' Dev'
          break
      case 'test':
          // Add 'test' suffix to name, so Electron will write all
          // data like cookies and localStorage into separate place.
          manifest.name += '-test'
          manifest.productName += ' Test'
          // Change the main entry to spec runner.
          manifest.main = 'spec.js'
          break
  }
  destDir.write('package.json', manifest)

  const configFilePath = projectDir.path('config/env_' + utils.getEnvName() + '.json')
  destDir.copy(configFilePath, 'env_config.json')
})

// Dev builds of assets with source maps and debug enabled
gulp.task('build-dev', ['clean', 'copy', 'webpack:build-dev'])
gulp.task('build', ['build-dev', 'finalize'])

const filesToWatch = [
  './**/*.coffee',
  './**/*.js',
  './**/*.vue',
  './src/**',
  '!./node_modules/**',
]

gulp.task('watch', function() {
  gulp.watch(filesToCopy, ['copy'])
  gulp.watch(filesToWatch, { cwd: 'app' }, ['webpack:build-dev'])  // This is watchign too many files and making things very angry.
})
