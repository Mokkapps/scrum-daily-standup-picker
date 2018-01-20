import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AppSettings } from 'app/models/app-settings';
import { TeamMember } from 'app/models/team-member';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

const settingsFile = './assets/settings.json';

@Injectable()
export class SettingsService {
  private appSettings: BehaviorSubject<
    AppSettings | undefined
  > = new BehaviorSubject(undefined);

  constructor(http: Http) {
    http
      .get(settingsFile)
      .toPromise()
      .then(response => {
        const settings = response.json();
        console.log(`Got settings: ${JSON.stringify(settings)}`);
        this.appSettings.next({
          standupPicker: settings.standupPicker,
          jiraUrl: settings.jiraUrl,
          slideshow: settings.slideshow
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  updateSettings(settings: AppSettings) {
    this.appSettings.next(settings);
    this.storeSettings();
  }

  get settings(): Observable<AppSettings | undefined> {
    return this.appSettings.asObservable();
  }

  private storeSettings() {
    // jsonfile.writeFileSync(settingsFile, this.appSettings.value);
  }
}
