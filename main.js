"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var log = require('electron-log');
var autoUpdater = require('electron-updater').autoUpdater;
var win, serve;
var args = process.argv.slice(1);
serve = args.some(function (val) { return val === '--serve'; });
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');
function sendStatusToWindow(text) {
    log.info(text);
    win.webContents.send('message', text);
}
function createWindow() {
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height
    });
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        win.loadURL('http://localhost:4200');
    }
    else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    // Open the DevTools.
    if (serve) {
        win.webContents.openDevTools();
    }
    // Check for updates
    autoUpdater.checkForUpdatesAndNotify();
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    electron_1.app.on('ready', createWindow);
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
    // Auto Updater
    autoUpdater.on('checking-for-update', function () {
        sendStatusToWindow('Checking for update...');
    });
    autoUpdater.on('update-available', function (info) {
        sendStatusToWindow('Update available.');
    });
    autoUpdater.on('update-not-available', function (info) {
        sendStatusToWindow('Update not available.');
    });
    autoUpdater.on('error', function (err) {
        sendStatusToWindow('Error in auto-updater. ' + err);
    });
    autoUpdater.on('download-progress', function (progressObj) {
        var log_message = 'Download speed: ' + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message =
            log_message +
                ' (' +
                progressObj.transferred +
                '/' +
                progressObj.total +
                ')';
        sendStatusToWindow(log_message);
    });
    autoUpdater.on('update-downloaded', function (info) {
        sendStatusToWindow('Update downloaded');
    });
}
catch (e) {
    // Catch Error
    log.error(e);
    // throw e;
}
