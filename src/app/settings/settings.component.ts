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

const DIST_PATH = './dist';
const IMAGES_PATH = '/assets/images/';
const SOUNDS_PATH = '/assets/sounds/';
const IMAGES_FILTER = { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] };
const SOUNDS_FILTER = {
  name: 'Sounds',
  extensions: ['wav', 'mp3', 'ogg', 'm4a']
};

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnDestroy {
  settings: Observable<AppSettings>;

  settingsForm: FormGroup;

  imageFiles: string[];

  soundFiles: string[];

  private appSettings: AppSettings;
  private settingsSubscription: Subscription;

  constructor(
    private settingsService: SettingsService,
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar
  ) {
    console.log('Init SettingsComponent');

    this.getImagesAndSounds().then(values => {
      this.imageFiles = values[0];
      this.soundFiles = values[1];
    });

    this.createForm();

    this.settings = settingsService.settings;
    settingsService.settings.subscribe(settings => {
      if (this.appSettings) {
        this.appSettings = settings;
        return;
      }

      this.appSettings = settings;
      this.initForm(settings);
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
    console.log(this.settingsForm);
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

  openElectronFilePicker(type: string): void {
    const filter = type === 'image' ? IMAGES_FILTER : SOUNDS_FILTER;
    electron.remote.dialog.showOpenDialog(
      {
        title: 'Select an image or sound',
        properties: ['openFile'],
        filters: [IMAGES_FILTER, SOUNDS_FILTER]
      },
      folderPath => {
        if (folderPath === undefined) {
          console.warn(`You did not select a ${type}`);
          return;
        }
        console.log(`Selected ${type} path ${folderPath}`);
        fs.readFile(folderPath.toString(), (err, data) => {
          if (err) {
            console.error(`Error reading file from ${folderPath}: ${err}`);
            this.snackBar.open(`Fehler beim Lesen: ${err}`, undefined, {
              duration: 2000
            });
            return;
          }
          const filename = (
            folderPath.toString().match(/[^\\/]+\.[^\\/]+$/) || []
          ).pop();
          fs.writeFile(
            `${DIST_PATH}${
              type === 'image' ? IMAGES_PATH : SOUNDS_PATH
            }${filename}`,
            data,
            // tslint:disable-next-line:no-shadowed-variable
            err => {
              if (err) {
                console.error(err);
                this.snackBar.open(`Fehler beim Speichern: ${err}`, undefined, {
                  duration: 2000
                });
                return;
              }
              console.log(`Successfully saved ${type}`);
              this.snackBar.open('Datei erfolgreich gespeichert', undefined, {
                duration: 2000
              });
              this.getImagesAndSounds().then(values => {
                this.imageFiles = values[0];
                this.soundFiles = values[1];
              });
            }
          );
        });
      }
    );
  }

  playSound(filePath: string): void {
    const audio = new Audio();
    audio.src = filePath;
    audio.load();
    audio.play();
  }

  private getImagesAndSounds(): Promise<any> {
    return Promise.all([this.readFiles('image'), this.readFiles('sound')]);
  }

  private readFiles(type: FileType): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(
        `${DIST_PATH}${type === 'image' ? IMAGES_PATH : SOUNDS_PATH}`,
        (err, files) => {
          if (err) {
            reject(err);
          }
          resolve(files);
        }
      );
    });
  }

  private initForm(settings: AppSettings): void {
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

export type FileType = 'image' | 'sound';
