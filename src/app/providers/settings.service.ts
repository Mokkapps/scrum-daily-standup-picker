import { Injectable } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';

import { AppSettings } from '../models/app-settings';
import { ElectronService } from './electron.service';
import { Subject, Observable } from 'rxjs';

const SETTINGS_VERSION = 2;
const LOCAL_STORAGE_KEY = `SETTINGS_V${SETTINGS_VERSION}`;

let imagesPath = '';
let soundsPath = '';

@Injectable()
export class SettingsService {
  private settingsSubject = new Subject<AppSettings>();
  private _settings: AppSettings;

  constructor(
    electronService: ElectronService,
    private localStorageService: LocalStorageService
  ) {
    imagesPath = electronService.imagesPath;
    soundsPath = electronService.soundsPath;

    const localStorageSettings: string = this.localStorageService.get(
      LOCAL_STORAGE_KEY
    );
    this._settings = localStorageSettings
      ? JSON.parse(localStorageSettings)
      : this.getDefaultSettings();
    this.settingsSubject.next(this._settings);
  }

  get settingsVersion(): number {
    return SETTINGS_VERSION;
  }

  get setting$(): Observable<AppSettings> {
    return this.settingsSubject.asObservable();
  }

  get settings(): AppSettings {
    return this._settings;
  }

  updateSettings(settings: AppSettings): void {
    this.localStorageService.set(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    this._settings = settings;
    this.settingsSubject.next(settings);
  }

  private getDefaultSettings(): AppSettings {
    return {
      version: SETTINGS_VERSION,
      standupPicker: {
        language: 'en_US',
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
