import { Injectable, NgZone } from '@angular/core';
import { AppSettings } from 'app/models/app-settings';
import { TeamMember } from 'app/models/team-member';
import * as fs from 'fs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

const SETTINGS_FILE_PATH = `${__dirname}/assets/settings.json`;
const IMAGES_PATH = `${__dirname}/assets/images/`;
const SOUNDS_PATH = `${__dirname}/assets/sounds/`;

@Injectable()
export class SettingsService {
  private appSettings: BehaviorSubject<
    AppSettings | undefined
  > = new BehaviorSubject(undefined);

  constructor(private zone: NgZone) {
    fs.readFile(SETTINGS_FILE_PATH, 'utf8', (err, data) => {
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
      fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings), err => {
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
        successSound: `${SOUNDS_PATH}success.wav`,
        standupEndReminderSound: `${SOUNDS_PATH}tickTock.wav`,
        standupMusic: [`${SOUNDS_PATH}cheerful-song.wav`],
        teamMembers: [
          {
            name: 'Max Mustermann',
            image: `${IMAGES_PATH}user1.jpeg`,
            disabled: false
          },
          {
            name: 'Rainer Zufall',
            image: `${IMAGES_PATH}user2.jpeg`,
            disabled: false
          },
          {
            name: 'Anna Bolika',
            image: `${IMAGES_PATH}user3.jpeg`,
            disabled: false
          }
        ]
      },
      jiraUrl: 'http://www.mokkapps.de',
      slideshow: {
        urls: ['http://www.github.com', 'http://www.atlassian.com'],
        timerInSec: 30
      }
    };
  }
}
