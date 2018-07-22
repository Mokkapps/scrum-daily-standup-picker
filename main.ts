import { app, BrowserWindow, screen, dialog } from 'electron';
import * as path from 'path';
import * as url from 'url';

const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const isDev = require('electron-is-dev');

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

log.transports.file.level = 'debug';
autoUpdater.logger = log;
// Disable auto download as ASAR is disabled and therefore code signing cannot be done
autoUpdater.autoDownload = false;

log.info('App starting...');

// Manage unhandled exceptions as early as possible
process.on('uncaughtException', e => {
  console.error(`Caught unhandled exception: ${e}`);
  dialog.showErrorBox(
    'Caught unhandled exception',
    e.message || 'Unknown error message'
  );
  app.quit();
});

function createWindow() {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  // Open the DevTools.
  if (serve) {
    win.webContents.openDevTools();
  }

  if (!isDev) {
    autoUpdater.checkForUpdates();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
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
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  // Auto Updater
  autoUpdater.on('error', error => {
    dialog.showErrorBox(
      'Error while looking for updates: ',
      error == null ? 'unknown' : (error.stack || error).toString()
    );
  });

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox(
      {
        type: 'info',
        title: 'Found Updates',
        message: 'Found updates, do you want update now?',
        buttons: ['Sure', 'No']
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          autoUpdater.downloadUpdate();
        }
      }
    );
  });

  autoUpdater.on('update-not-available', () => {
    dialog.showMessageBox({
      title: 'No Updates',
      message: 'Current version is up-to-date.'
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(
      {
        title: 'Install Updates',
        message: 'Updates downloaded, application will be quit for update...'
      },
      () => {
        setImmediate(() => autoUpdater.quitAndInstall());
      }
    );
  });
} catch (e) {
  // Catch Error
  log.error(e);
  // throw e;
}
