import { Component, OnInit } from '@angular/core';

const URLS = ['http://mokkapps.de', 'http://bild.de', 'http://rebelgamer.de'];

@Component({
  selector: 'app-external-page',
  template: `<iframe [src]="url | safe"></iframe>`,
  styleUrls: ['./external-page.component.scss']
})
export class ExternalPageComponent {
  url: string;

  constructor() {
    this.url = 'http://mokkapps.de';
    setInterval(() => {
      this.url = URLS[this.getRandomInt(0, URLS.length - 1)];
    }, 10 * 1000);
  }

  private getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
