import { browser, by, element } from 'protractor';

/* tslint:disable */
export class AngularElectronPage {
  navigateTo(route: string) {
    return browser.get(route);
  }
}
