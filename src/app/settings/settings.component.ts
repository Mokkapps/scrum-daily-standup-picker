import { Component, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { AppSettings } from 'app/models/app-settings';
import { TeamMember } from 'app/models/team-member';
import { SettingsService } from 'app/settings/settings.service';
import { readFile } from 'jsonfile';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

// see https://github.com/electron/electron/issues/7300
const electron = (<any>window).require('electron');
const fs = (<any>window).require('fs');

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnDestroy {
  settings: Observable<AppSettings>;

  settingsForm: FormGroup;

  private appSettings: AppSettings;
  private settingsSubscription: Subscription;

  constructor(
    private settingsService: SettingsService,
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar
  ) {
    console.log('Init SettingsComponent');

    this.createForm();

    this.settings = settingsService.settings;
    settingsService.settings.subscribe(settings => {
      this.appSettings = settings;

      this.settingsForm.patchValue({
        jiraUrl: settings.jiraUrl
      });

      this.getStandupPickerFormGroup().patchValue({
        standupHour: settings.standupPicker.standupHour,
        standupMinute: settings.standupPicker.standupMinute,
        standupTimeInMin: settings.standupPicker.standupTimeInMin,
        standupEndReminderAfterMin:
          settings.standupPicker.standupEndReminderAfterMin,
        successSound: settings.standupPicker.successSound,
        standupEndReminderSound: settings.standupPicker.standupEndReminderSound
      });

      this.appSettings.standupPicker.teamMembers.forEach(teamMember => {
        this.addNewTeamMemberRow(
          teamMember.name,
          teamMember.imageUrl,
          teamMember.role
        );
      });

      this.appSettings.slideshow.urls.forEach(url => {
        this.addNewSlideshowUrlRow(url);
      });

      this.appSettings.standupPicker.standupMusic.forEach(path => {
        this.addNewStandupMusicPathRow(path);
      });

      this.getSlideshowFormGroup().patchValue({
        timerInSec: settings.slideshow.timerInSec
      });
    });
  }

  get teamMembers(): FormArray {
    return <FormArray>this.getStandupPickerFormGroup().controls.teamMembers;
  }

  get standupMusic(): FormArray {
    return <FormArray>this.getStandupPickerFormGroup().controls.standupMusic;
  }

  get slideshowUrls(): FormArray {
    return <FormArray>this.getSlideshowFormGroup().controls.urls;
  }

  onSubmit(): void {
    console.log('SUBMIT');
    this.settingsService
      .updateSettings({
        standupPicker: this.settingsForm.value.standupPicker,
        jiraUrl: this.settingsForm.value.jiraUrl,
        slideshow: this.settingsForm.value.slideshow
      })
      .then(() => {
        this.snackBar.open('Einstellungen wurden gespeichert', undefined, {
          duration: 2000
        });
      })
      .catch(err => {
        this.snackBar.open(
          `Fehler beim Speichern der Einstellungen: ${err}`,
          undefined,
          {
            duration: 3000
          }
        );
      });
  }

  revert(): void {
    console.log('REVERT');
  }

  addNewTeamMemberRow(name?: string, imageUrl?: string, role?: string): void {
    const control = <FormArray>this.getStandupPickerFormGroup().controls
      .teamMembers;
    control.push(this.createTeamMember(name, imageUrl, role));
  }

  deleteTeamMemberRow(index: number): void {
    const control = <FormArray>this.getStandupPickerFormGroup().controls
      .teamMembers;
    control.removeAt(index);
  }

  addNewSlideshowUrlRow(url?: string): void {
    const control = <FormArray>this.getSlideshowFormGroup().controls.urls;
    control.push(new FormControl(url));
  }

  deleteSlideshowUrlRow(index: number): void {
    const control = <FormArray>this.getSlideshowFormGroup().controls.urls;
    control.removeAt(index);
  }

  addNewStandupMusicPathRow(path?: string): void {
    const control = <FormArray>this.getStandupPickerFormGroup().controls
      .standupMusic;
    control.push(new FormControl(path));
  }

  deleteStandupMusicPathRow(index: number): void {
    const control = <FormArray>this.getStandupPickerFormGroup().controls
      .standupMusic;
    control.removeAt(index);
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }

  openElectronWindow(): void {
    electron.remote.dialog.showOpenDialog(
      {
        title: 'Select a image',
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['jpg', 'png'] }]
      },
      folderPath => {
        if (folderPath === undefined) {
          console.warn('You did not select an image');
          return;
        }
        console.log(`Selected image path ${folderPath}`);
        fs.readFile(folderPath.toString(), (err, data) => {
          if (err) {
            console.error(`Error reading file from ${folderPath}: ${err}`);
            return;
          }
          console.log(data);
          // tslint:disable-next-line:no-shadowed-variable
          fs.writeFile('./dist/assets/images/test.png', data, err => {
            if (err) {
              throw err;
            }
            console.log('It is saved!');
          });
        });
      }
    );
  }

  private getStandupPickerFormGroup(): FormGroup {
    return <FormGroup>this.settingsForm.controls.standupPicker;
  }

  private getSlideshowFormGroup(): FormGroup {
    return <FormGroup>this.settingsForm.controls.slideshow;
  }

  private createForm(): void {
    this.settingsForm = this.formBuilder.group({
      standupPicker: this.formBuilder.group({
        teamMembers: this.formBuilder.array([]),
        standupMusic: this.formBuilder.array([]),
        standupHour: undefined,
        standupMinute: undefined,
        standupTimeInMin: undefined,
        standupEndReminderAfterMin: undefined,
        successSound: undefined,
        standupEndReminderSound: undefined
      }),
      jiraUrl: undefined,
      slideshow: this.formBuilder.group({
        timerInSec: undefined,
        urls: this.formBuilder.array([])
      })
    });
  }

  private createTeamMember(
    name?: string,
    imageUrl?: string,
    role?: string
  ): FormGroup {
    return this.formBuilder.group({
      name: name ? name : '',
      imageUrl: imageUrl ? imageUrl : '',
      role: role ? role : ''
    });
  }
}
