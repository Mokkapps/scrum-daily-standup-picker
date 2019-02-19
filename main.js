"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var log = require("electron-log");
var electron_updater_1 = require("electron-updater");
var isDev = require("electron-is-dev");
var win, serve;
var args = process.argv.slice(1);
serve = args.some(function (val) { return val === '--serve'; });
var GITHUB_RELEASE_URL = 'https://github.com/Mokkapps/scrum-daily-standup-picker/releases';
var isLinux = process.platform === 'linux';
log.transports.file.level = 'debug';
electron_updater_1.autoUpdater.logger = log;
// Disable auto download as ASAR is disabled and therefore code signing cannot be done
electron_updater_1.autoUpdater.autoDownload = false;
log.info('App starting...');
// Manage unhandled exceptions as early as possible
process.on('uncaughtException', function (e) {
    console.error("Caught unhandled exception: " + e);
    log.error("Caught unhandled exception: " + e);
    electron_1.dialog.showErrorBox('Caught unhandled exception', e.message || 'Unknown error message');
    electron_1.app.quit();
});
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
    // Standup picker only works with .deb on Linux but auto-updater
    // does not work for .deb and only for AppImage and Snap
    if (!isDev && !isLinux) {
        electron_updater_1.autoUpdater.checkForUpdates();
    }
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
    electron_updater_1.autoUpdater.on('error', function (error) {
        electron_1.dialog.showErrorBox('Error while looking for updates: ', error == null ? 'unknown' : (error.stack || error).toString());
    });
    electron_updater_1.autoUpdater.on('update-available', function () {
        electron_1.dialog.showMessageBox({
            type: 'info',
            title: 'Found Updates',
            message: 'Found updates, do you want update now?',
            buttons: ['Sure', 'No']
        }, function (buttonIndex) {
            if (buttonIndex === 0) {
                electron_1.shell.openExternal(GITHUB_RELEASE_URL);
            }
        });
    });
    electron_updater_1.autoUpdater.on('update-not-available', function () {
        log.info('Current version is up-to-date');
    });
}
catch (e) {
    log.error(e);
    // throw e;
}
