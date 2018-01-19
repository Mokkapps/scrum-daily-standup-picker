import { SettingsService, AppSettings } from 'app/settings/settings.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

// see https://github.com/electron/electron/issues/7300
const electron = (<any>window).require('electron');

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  settings: Observable<AppSettings>;

  settingsForm: FormGroup;

  private settingsSubscription: Subscription;

  constructor(settingsService: SettingsService, private fb: FormBuilder) {
    console.log('Init SettingsComponent');
    this.settings = settingsService.settings;
    this.createForm();
  }

  openElectronWindow() {
    electron.remote.dialog.showOpenDialog(
      { title: 'Select a folder', properties: ['openDirectory'] },
      folderPath => {
        if (folderPath === undefined) {
          console.log('You did not select a folder');
          return;
        }
        console.log(`Selected folder ${folderPath}`);
      }
    );
  }

  private createForm() {
    this.settingsForm = this.fb.group({
      name: ''
    });
  }
}
