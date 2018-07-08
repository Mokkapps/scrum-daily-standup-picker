import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Observable, BehaviorSubject } from 'rxjs';

import { AppSettings } from '../models/app-settings';
import { FileService } from './file.service';
import { ElectronService } from './electron.service';

const SETTINGS_VERSION = 1;

let assetsPath = '';
let settingsFilePath = '';
let imagesPath = '';
let soundsPath = '';

@Injectable()
export class SettingsService {
  private appSettings: BehaviorSubject<
    AppSettings | undefined
  > = new BehaviorSubject(undefined);

  constructor(
    public snackBar: MatSnackBar,
    private zone: NgZone,
    electronService: ElectronService,
    private fileService: FileService
  ) {
    assetsPath = electronService.assetsPath;
    settingsFilePath = electronService.settingsFilePath;
    imagesPath = electronService.imagesPath;
    soundsPath = electronService.soundsPath;

    this.readStoredSettings();
  }

  get settingsVersion(): number {
    return SETTINGS_VERSION;
  }

  get settings(): Observable<AppSettings | undefined> {
    return this.appSettings.asObservable();
  }

  readStoredSettings(): void {
    this.fileService
      .readFile(settingsFilePath)
      .then(data => {
        this.zone.run(() => {
          this.appSettings.next(JSON.parse(data));
        });
      })
      .catch(err => {
        console.log('No stored settings available, load default settings', err);
        // Store default settings if no settings are available
        this.storeDefaultSettings();
      });
  }

  updateSettings(settings: AppSettings): Promise<any> {
    this.zone.run(() => {
      this.appSettings.next(settings);
    });
    return this.storeSettings(settings);
  }

  private storeDefaultSettings() {
    this.storeSettings(this.getDefaultSettings())
      .then(() => {
        this.zone.run(() => {
          this.appSettings.next(this.getDefaultSettings());
        });
      })
      .catch(err => {
        console.error(
          `Error storing default settings to ${settingsFilePath}`,
          err
        );
        this.snackBar.open(err, undefined, {
          duration: 2000
        });
      });
  }

  private storeSettings(settings: AppSettings): Promise<any> {
    return this.fileService.writeFile(
      settingsFilePath,
      JSON.stringify(settings)
    );
  }

  private getDefaultSettings(): AppSettings {
    return {
      version: SETTINGS_VERSION,
      standupPicker: {
        background: `${imagesPath}background.jpg`,
        standupHour: 9,
        standupMinute: 59,
        standupTimeInMin: 15,
        standupEndReminderAfterMin: 10,
        successSound: `${soundsPath}success.wav`,
        standupEndReminderSound: `${soundsPath}tickTock.wav`,
        standupMusic: [
          {
            path: `${soundsPath}success.wav`,
            name: 'success.wav',
            selected: true
          }
        ],
        teamMembers: [
          {
            name: 'Max Mustermann',
            image: `${imagesPath}placeholder.png`,
            disabled: false
          },
          {
            name: 'Erika Mustermann',
            image: `${imagesPath}placeholder.png`,
            disabled: false
          }
        ]
      }
    };
  }
}
