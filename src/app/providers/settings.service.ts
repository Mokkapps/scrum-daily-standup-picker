import { Injectable, NgZone } from '@angular/core';
import { AppSettings } from 'app/models/app-settings';
import { TeamMember } from 'app/models/team-member';
import * as fs from 'fs';
import * as path from 'path';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

let settingsFilePath = '';
let imagesPath = '';
let soundsPath = '';

declare var global: any;

@Injectable()
export class SettingsService {
  private appSettings: BehaviorSubject<
    AppSettings | undefined
  > = new BehaviorSubject(undefined);

  constructor(private zone: NgZone) {
    settingsFilePath = path.join(global.__static, '/settings.json');
    imagesPath = path.join(global.__static, '/images/');
    soundsPath = path.join(global.__static, '/sounds/');

    fs.readFile(settingsFilePath, 'utf8', (err, data) => {
      if (err) {
        console.log(err);

        this.storeSettings(this.getDefaultSettings())
          .then(() => {
            console.log('Set inital settings');
            this.zone.run(() => {
              this.appSettings.next(this.getDefaultSettings());
            });
          })
          // tslint:disable-next-line:no-shadowed-variable
          .catch(err => {
            console.error(err);
          });
        return;
      }

      const settings = JSON.parse(data);
      console.log('Got settings:', settings);
      this.zone.run(() => {
        this.appSettings.next(settings);
      });
    });
  }

  updateSettings(settings: AppSettings): Promise<any> {
    console.log('Update settings with', settings);
    this.zone.run(() => {
      this.appSettings.next(settings);
    });
    return this.storeSettings(settings);
  }

  get settings(): Observable<AppSettings | undefined> {
    return this.appSettings.asObservable();
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
      standupPicker: {
        standupHour: 9,
        standupMinute: 59,
        standupTimeInMin: 15,
        standupEndReminderAfterMin: 10,
        successSound: `${soundsPath}success.wav`,
        standupEndReminderSound: `${soundsPath}tickTock.wav`,
        standupMusic: [`${soundsPath}cheerful-song.wav`],
        teamMembers: [
          {
            name: 'Max Mustermann',
            image: `${imagesPath}user1.jpeg`,
            disabled: false
          },
          {
            name: 'Rainer Zufall',
            image: `${imagesPath}user2.jpeg`,
            disabled: false
          },
          {
            name: 'Anna Bolika',
            image: `${imagesPath}user3.jpeg`,
            disabled: false
          }
        ]
      }
    };
  }
}
