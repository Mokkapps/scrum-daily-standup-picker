import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const settingsFile = './assets/settings.json';

const DEFAULT_SLIDESHOW_TIME = 30;

@Injectable()
export class SettingsService {
  private appSettings: BehaviorSubject<AppSettings | undefined> = new BehaviorSubject(undefined);

  constructor(http: Http) {
    console.log('Init SettingsService');
    let initialSettings: AppSettings = {
      memberImages: [],
      standupMusic: [],
      jiraUrl: '',
      slideshowURLs: [],
      slideshowTimeInSec: 0
    };

    http
      .get(settingsFile)
      .toPromise()
      .then(response => {
        const settings = response.json();
        console.log(`Got settings: ${settings}`);
        initialSettings = {
          memberImages: settings.memberImages ? settings.memberImages : [],
          standupMusic: settings.standupMusic ? settings.standupMusic : [],
          jiraUrl: settings.jiraUrl,
          slideshowURLs: settings.slideshowURLs,
          slideshowTimeInSec: settings.slideshowTimeInSec
            ? settings.slideshowTimeInSec
            : DEFAULT_SLIDESHOW_TIME
        };
        this.appSettings.next(initialSettings);
      })
      .catch(err => {
        console.log(err);
      });
  }

  set jiraUrl(jiraUrl: string) {
    this.appSettings.next({ ...this.appSettings.value, jiraUrl });
    this.updateSettings();
  }

  set slideshowURLs(slideshowURLs: String[]) {
    this.appSettings.next({ ...this.appSettings.value, slideshowURLs });
    this.updateSettings();
  }

  set slideshowTimeInSec(slideshowTimeInSec: number) {
    this.appSettings.next({ ...this.appSettings.value, slideshowTimeInSec });
    this.updateSettings();
  }

  get settings(): Observable<AppSettings | undefined> {
    return this.appSettings.asObservable();
  }

  private updateSettings() {
    // jsonfile.writeFileSync(settingsFile, this.appSettings.value);
  }
}

export type AppSettings = {
  memberImages: String[] | undefined;
  standupMusic: String[];
  jiraUrl: string | undefined;
  slideshowURLs: String[] | undefined;
  slideshowTimeInSec: number;
};
