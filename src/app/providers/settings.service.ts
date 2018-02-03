import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { AppSettings } from 'app/models/app-settings';
import { TeamMember } from 'app/models/team-member';
import { remote } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

let assetsPath = '';
let settingsFilePath = '';
let imagesPath = '';
let soundsPath = '';

@Injectable()
export class SettingsService {
  private appSettings: BehaviorSubject<
    AppSettings | undefined
  > = new BehaviorSubject(undefined);

  constructor(public snackBar: MatSnackBar, private zone: NgZone) {
    const appPath = remote.app.getAppPath();

    assetsPath = path.join(appPath, '/assets/');
    settingsFilePath = path.join(appPath, '/assets/settings.json');
    imagesPath = path.join(appPath, '/assets/images/');
    soundsPath = path.join(appPath, '/assets/sounds/');

    fs.readFile(settingsFilePath, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        // Store default settings if no settings are available
        this.storeDefaultSettings();
        return;
      }

      this.zone.run(() => {
        this.appSettings.next(JSON.parse(data));
      });
    });
  }

  updateSettings(settings: AppSettings): Promise<any> {
    this.zone.run(() => {
      this.appSettings.next(settings);
    });
    return this.storeSettings(settings);
  }

  get settings(): Observable<AppSettings | undefined> {
    return this.appSettings.asObservable();
  }

  get assetsPath(): string {
    const appPath = remote.app.getAppPath();
    return path.join(appPath, '/assets/');
  }

  private storeDefaultSettings() {
    this.storeSettings(this.getDefaultSettings())
      .then(() => {
        this.zone.run(() => {
          this.appSettings.next(this.getDefaultSettings());
        });
      })
      .catch(err => {
        console.log(err);
        this.snackBar.open(err, undefined, {
          duration: 2000
        });
      });
  }

  private storeSettings(settings: AppSettings): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.writeFile(settingsFilePath, JSON.stringify(settings), err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private getDefaultSettings(): AppSettings {
    return {
      version: 1,
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
