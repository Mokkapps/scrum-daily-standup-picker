import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppSettings } from 'app/models/app-settings';
import { SettingsService } from 'app/providers/settings.service';
import { Subscription } from 'rxjs/Rx';

const DEFAULT_URL = 'https://www.mokkapps.de';

@Component({
  selector: 'app-external-page',
  template: `<iframe [src]="url | safe"></iframe>`,
  styleUrls: ['./external-page.component.scss']
})
export class ExternalPageComponent implements OnInit, OnDestroy {
  url: String = DEFAULT_URL;

  private settings: AppSettings;

  private settingsSubscription: Subscription;

  constructor(settingsService: SettingsService, private router: Router) {
    this.settingsSubscription = settingsService.settings.subscribe(settings => {
      if (!settings) {
        return;
      }
      this.settings = settings;
    });
  }

  ngOnInit(): void {
    if (this.router.url.includes('slideshow')) {
      console.log('SLIDESHOW');
      setInterval(() => {
        this.url = this.settings.slideshow.urls[
          this.getRandomInt(0, this.settings.slideshow.urls.length - 1)
        ];
      }, this.settings.slideshow.timerInSec * 1000);
    } else {
      console.log('SINGLE URL');
      this.url = this.settings.jiraUrl;
    }
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
