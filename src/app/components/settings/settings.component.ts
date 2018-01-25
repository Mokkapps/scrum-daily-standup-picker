import { Component, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { AppSettings } from 'app/models/app-settings';
import { TeamMember } from 'app/models/team-member';
import { SettingsService } from 'app/providers/settings.service';
import * as electron from 'electron';
import * as fs from 'fs';
import { readFile } from 'jsonfile';
import * as path from 'path';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

const IMAGES_FILTER = { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] };
const SOUNDS_FILTER = {
  name: 'Sounds',
  extensions: ['wav', 'mp3', 'ogg', 'm4a']
};

declare var global: any;

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

  imagesPath = '';

  soundsPath = '';

  private appSettings: AppSettings;
  private settingsSubscription: Subscription;

  constructor(
    private settingsService: SettingsService,
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private router: Router
  ) {
    this.imagesPath = path.join(global.__static, '/images/');
    this.soundsPath = path.join(global.__static, '/sounds/');

    console.log('Dirname', __dirname);
    console.log('Process env', process.env);
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

  navigateBack() {
    this.router.navigate(['../']);
  }

  onSubmit(): void {
    console.log(this.settingsForm);
    this.settingsService
      .updateSettings({
        standupPicker: this.settingsForm.value.standupPicker
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

  addNewTeamMemberRow(name?: string, image?: string): void {
    const control = <FormArray>this.getStandupPickerFormGroup().controls
      .teamMembers;
    control.push(this.createTeamMember(name, image));
  }

  deleteTeamMemberRow(index: number): void {
    const control = <FormArray>this.getStandupPickerFormGroup().controls
      .teamMembers;
    control.removeAt(index);
  }

  // tslint:disable-next-line:no-shadowed-variable
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
        filters: [filter]
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
            `${type === 'image' ? this.imagesPath : this.soundsPath}${filename}`,
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
        `${type === 'image' ? this.imagesPath : this.soundsPath}`,
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
      this.addNewTeamMemberRow(teamMember.name, teamMember.image);
    });

    this.appSettings.standupPicker.standupMusic.forEach(path => {
      this.addNewStandupMusicPathRow(path);
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
      })
    });
  }

  private createTeamMember(name?: string, image?: string): FormGroup {
    return this.formBuilder.group({
      name: name ? name : '',
      image: image ? image : ''
    });
  }
}

export type FileType = 'image' | 'sound';
