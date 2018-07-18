import { SettingsService } from './providers/settings.service';
import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';

export const AVAILABLE_LANGUAGES = ['de_DE', 'en_US'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    electronService: ElectronService,
    translate: TranslateService,
    settingsService: SettingsService
  ) {
    translate.setDefaultLang('en_US');
    translate.use(settingsService.settings.standupPicker.language);

    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }
}
