import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;

  electron: any;

  private _imagesPath: string;
  private _soundsPath: string;
  private _assetsPath: string;
  private _settingsFilePath: string;

  constructor(private translateService: TranslateService) {
    // Conditional imports
    if (this.isElectron()) {
      this.electron = window.require('electron');

      this.ipcRenderer = this.electron.ipcRenderer;
      this.webFrame = this.electron.webFrame;
      this.remote = this.electron.remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');

      const appPath = this.electron.remote.app.getAppPath();
      const assetsPath = '/dist/assets';

      // App paths
      this._imagesPath = path.join(appPath, `${assetsPath}/images/`);
      this._soundsPath = path.join(appPath, `${assetsPath}/sounds/`);
      this._assetsPath = path.join(appPath, assetsPath);
      this._settingsFilePath = path.join(
        appPath,
        `${assetsPath}/settings.json`
      );

      console.log(
        this._imagesPath,
        this._soundsPath,
        this._assetsPath,
        this._settingsFilePath
      );
    }
  }

  isElectron(): any {
    return window && window.process && window.process.type;
  }

  get imagesPath(): string {
    return this._imagesPath;
  }

  get soundsPath(): string {
    return this._soundsPath;
  }

  get assetsPath(): string {
    return this._assetsPath;
  }

  get settingsFilePath(): string {
    return this._settingsFilePath;
  }

  get appVersion(): string {
    return this.electron.remote.app.getVersion();
  }

  openExternal(url: string) {
    this.electron.shell.openExternal(url);
  }

  showSaveDialog(title: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.electron.remote.dialog.showSaveDialog(
        {
          title
        },
        folderPath => {
          if (!folderPath) {
            reject('No folder selected');
          }
          resolve(folderPath);
        }
      );
    });
  }

  showOpenDialog(
    title: string,
    properties: any, // No Electron type available
    filter?: {
      name: string;
      extensions: string[];
    }
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.electron.remote.dialog.showOpenDialog(
        {
          title: title,
          properties: properties,
          filters: [filter]
        },
        folderPaths => {
          if (!folderPaths) {
            reject(
              this.translateService.instant(
                'PAGES.SETTINGS.FORM.FILE_UPLOAD.NO_FOLDER_SELECTED'
              )
            );
          }
          resolve(folderPaths);
        }
      );
    });
  }
}
