// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.
var app = require('app')
var BrowserWindow = require('browser-window')
// var ffmpegProcess = require('ffmpeg-lib-node')
// var audioEngine = ffmpegProcess.createNewFFmpegEngine()
// audioEngine.startRecord('sss')
// var appmenu = require('./appmenu/appmenu')

// var devHelper = require('./vendor/electron_boilerplate/dev_helper');
var mainWindow

// Preserver of the window size and position between app launches.
// var mainWindowState = windowStateKeeper('main', {
//   width: 1000,
//   height: 600
// })

app.on('ready', function () {
  // appmenu.InitMenu()
  mainWindow = new BrowserWindow({
    // x: mainWindowState.x,
    // y: mainWindowState.y,
    // width: mainWindowState.width,
    // height: mainWindowState.height
    width: 1000,
    height: 600
  })

  // if (mainWindowState.isMaximized) {
  //   mainWindow.maximize()
  // }

  var filepath = 'file://' + __dirname + '/index.html'
  mainWindow.loadUrl(filepath)

  // if (env.name !== 'production') {
  // devHelper.setDevMenu()
  mainWindow.openDevTools()
  // }

  mainWindow.on('close', function () {
    // mainWindowState.saveState(mainWindow);
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform != 'darwin') {
  app.quit()
  // }
})
