import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import * as childProcess from 'child_process';
import { ipcRenderer, remote, shell } from 'electron';
import * as path from 'path';

@Injectable()
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  childProcess: typeof childProcess;

  private _imagesPath: string;
  private _soundsPath: string;
  private _assetsPath: string;
  private _settingsFilePath: string;

  constructor(private translateService: TranslateService) {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.childProcess = window.require('child_process');
    }

    // App paths
    const appPath = remote.app.getAppPath();
    this._imagesPath = path.join(appPath, '/assets/images/');
    this._soundsPath = path.join(appPath, '/assets/sounds/');
    this._assetsPath = path.join(appPath, '/assets/');
    this._settingsFilePath = path.join(appPath, '/assets/settings.json');
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
    return remote.app.getVersion();
  }

  openExternal(url: string) {
    shell.openExternal(url);
  }

  isElectron() {
    return window && window.process && window.process.type;
  }

  showSaveDialog(title: string): Promise<string> {
    return new Promise((resolve, reject) => {
      remote.dialog.showSaveDialog(
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
      remote.dialog.showOpenDialog(
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
