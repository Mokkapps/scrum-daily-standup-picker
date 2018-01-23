import { Injectable, NgZone } from '@angular/core';
import { AppSettings } from 'app/models/app-settings';
import { TeamMember } from 'app/models/team-member';
import * as fs from 'fs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

const SETTINGS_FILE_PATH = `${__dirname}/assets/settings.json`;

@Injectable()
export class SettingsService {
  private appSettings: BehaviorSubject<
    AppSettings | undefined
  > = new BehaviorSubject(undefined);

  constructor(private zone: NgZone) {
    fs.readFile(SETTINGS_FILE_PATH, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const settings = JSON.parse(data);
        console.log('Got settings:', settings);
        this.zone.run(() => {
          this.appSettings.next({
            standupPicker: settings.standupPicker,
            jiraUrl: settings.jiraUrl,
            slideshow: settings.slideshow
          });
        });
      }
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
}
