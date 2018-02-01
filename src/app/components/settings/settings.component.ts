import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as electron from 'electron';
import * as fs from 'fs';
import { readFile } from 'jsonfile';
import * as path from 'path';
import { Observable } from 'rxjs/Observable';

import { AboutDialogComponent } from 'app/components/settings/dialog/about-dialog.component';
import { AppSettings } from 'app/models/app-settings';
import { TeamMember } from 'app/models/team-member';
import { SettingsService } from 'app/providers/settings.service';
import { StandupSound } from '../../models/app-settings';
import { ConfirmDialogComponent } from './dialog/confirm-dialog.component';

const random_name = require('node-random-name');

const DIALOG_WIDTH = '500px';
const ERROR_DURATION_IN_MS = 5000;
const NUMBER_PATTERN = '[0-9]+';
const IMAGES_FILTER = { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] };
const SOUNDS_FILTER = {
  name: 'Sounds',
  extensions: ['wav', 'mp3', 'ogg', 'm4a']
};
const BACKUP_FILTER = {
  name: 'Backup',
  extensions: ['json']
};

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  settingsForm: FormGroup;

  imageFiles: string[];

  soundFiles: string[];

  imagesPath = '';

  soundsPath = '';

  private appSettings: AppSettings;

  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private settingsService: SettingsService,
    private formBuilder: FormBuilder,
    private router: Router,
    private translateService: TranslateService
  ) {
    const appPath = electron.remote.app.getAppPath();
    this.imagesPath = path.join(appPath, '/assets/images/');
    this.soundsPath = path.join(appPath, '/assets/sounds/');

    this.createForm();

    settingsService.settings
      .filter(settings => settings !== undefined)
      .first()
      .subscribe(settings => {
        this.appSettings = settings;
        this.updateForm(settings);
      });
  }

  get teamMembers(): FormArray {
    return <FormArray>this.getStandupPickerFormGroup().controls.teamMembers;
  }

  get standupMusic(): FormArray {
    return <FormArray>this.getStandupPickerFormGroup().controls.standupMusic;
  }

  deleteAllFiles(fileType: FileType) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: {
        title: this.translateService.instant(
          'PAGES.SETTINGS.FORM.FILE_UPLOAD.DELETE_DIALOG.TITLE'
        ),
        message: this.translateService.instant(
          fileType === 'image'
            ? 'PAGES.SETTINGS.FORM.FILE_UPLOAD.DELETE_DIALOG.MESSAGE_IMAGES'
            : 'PAGES.SETTINGS.FORM.FILE_UPLOAD.DELETE_DIALOG.MESSAGE_SOUNDS'
        )
      }
    });

    dialogRef
      .afterClosed()
      .first()
      .subscribe(result => {
        if (result === true) {
          this.deleteAllFilesInDirectory(fileType)
            .then(() => {
              console.log(`Deleted all files of type ${fileType}`);
              this.showSnackbar(
                this.translateService.instant(
                  'PAGES.SETTINGS.FORM.FILE_UPLOAD.DELETE_DIALOG.SUCCESS'
                )
              );
              this.updateForm(this.appSettings);
            })
            .catch(err => {
              const errorText = this.translateService.instant(
                'PAGES.SETTINGS.FORM.FILE_UPLOAD.DELETE_DIALOG.ERROR'
              );
              this.showSnackbar(`${errorText} ${err}`, ERROR_DURATION_IN_MS);
            });
        }
      });
  }

  navigateBack() {
    if (this.settingsForm.dirty) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: DIALOG_WIDTH,
        data: {
          title: this.translateService.instant(
            'PAGES.SETTINGS.LEAVE_DIALOG.TITLE'
          ),
          message: this.translateService.instant(
            'PAGES.SETTINGS.LEAVE_DIALOG.MESSAGE'
          )
        }
      });

      dialogRef
        .afterClosed()
        .first()
        .subscribe(result => {
          if (result === true) {
            this.router.navigate(['../']);
          }
        });
    } else {
      this.router.navigate(['../']);
    }
  }

  onSubmit(): void {
    if (!this.settingsForm.valid) {
      this.validateAllFormFields(this.settingsForm);
      this.showSnackbar(
        this.translateService.instant('PAGES.SETTINGS.FORM.INVALID_FORM')
      );
      return;
    }
    console.log('Submit', this.settingsForm.value.standupPicker);
    this.settingsService
      .updateSettings({
        standupPicker: this.settingsForm.value.standupPicker
      })
      .then(() => {
        this.showSnackbar(
          this.translateService.instant('PAGES.SETTINGS.FORM.SAVE_SUCCESS'),
          3000
        );
        this.settingsForm.markAsPristine();
        this.router.navigate(['../']);
      })
      .catch(err => {
        const errorText = this.translateService.instant(
          'PAGES.SETTINGS.FORM.SAVE_ERROR'
        );
        this.showSnackbar(`${errorText} ${err}`, ERROR_DURATION_IN_MS);
      });
  }

  addNewStandupSound(sound: StandupSound): void {
    const control = <FormArray>this.getStandupPickerFormGroup().controls
      .standupMusic;
    control.push(this.createStandupSoundGroup(sound));
  }

  addNewTeamMemberRow(name?: string, image?: string): void {
    const control = <FormArray>this.getStandupPickerFormGroup().controls
      .teamMembers;
    control.push(this.createTeamMemberGroup(name, image));
  }

  deleteTeamMemberRow(index: number): void {
    const control = <FormArray>this.getStandupPickerFormGroup().controls
      .teamMembers;
    control.removeAt(index);
  }

  getNumberErrorMessage(formControlName: string): string | undefined {
    const formControl = this.settingsForm.get(formControlName);
    if (!formControl) {
      return;
    }
    return formControl.hasError('required')
      ? this.translateService.instant('PAGES.SETTINGS.FORM.VALIDATORS.REQUIRED')
      : formControl.hasError('pattern')
        ? this.translateService.instant(
            'PAGES.SETTINGS.FORM.VALIDATORS.NUMBER_PATTERN'
          )
        : '';
  }

  openElectronFilePicker(type: string) {
    this.importFiles(type)
      .then(() => {
        console.log(`Successfully saved ${type}`);
        this.showSnackbar(
          this.translateService.instant(
            'PAGES.SETTINGS.FORM.FILE_UPLOAD.IMPORT_SUCCESS'
          )
        );
        this.updateForm(this.appSettings);
      })
      .catch(err => {
        const errorMessage = this.translateService.instant(
          'PAGES.SETTINGS.FORM.FILE_UPLOAD.IMPORT_ERROR'
        );
        this.showSnackbar(`${errorMessage} ${err}`);
      });
  }

  showAboutDialog() {
    const dialogRef = this.dialog.open(AboutDialogComponent, {
      width: DIALOG_WIDTH
    });
  }

  importSettings() {
    this.importBackup()
      .then(() => {
        this.showSnackbar(
          this.translateService.instant(
            'PAGES.SETTINGS.FORM.FILE_UPLOAD.IMPORT.SUCCESS'
          )
        );
      })
      .catch(err => {
        const errorMessage = this.translateService.instant(
          'PAGES.SETTINGS.FORM.FILE_UPLOAD.IMPORT.ERROR'
        );
        this.showSnackbar(`${errorMessage} ${err}`);
      });
  }

  exportSettings() {
    this.exportFiles()
      .then(() => {
        this.showSnackbar(
          this.translateService.instant(
            'PAGES.SETTINGS.FORM.FILE_UPLOAD.EXPORT.SUCCESS'
          )
        );
      })
      .catch(err => {
        const errorMessage = this.translateService.instant(
          'PAGES.SETTINGS.FORM.FILE_UPLOAD.EXPORT.ERROR'
        );
        this.showSnackbar(`${errorMessage} ${err}`);
      });
  }

  private getStandupSounds(): StandupSound[] {
    return this.soundFiles.map(soundFile => {
      let selected = true;
      const filtered = this.appSettings.standupPicker.standupMusic.filter(
        sound => sound.path === `${this.soundsPath}${soundFile}`
      );
      if (filtered.length > 0) {
        selected = filtered[0].selected;
      }

      return {
        path: `${this.soundsPath}${soundFile}`,
        name: soundFile,
        selected
      };
    });
  }

  private async deleteAllFilesInDirectory(fileType: FileType) {
    const files = await this.readFilesFromDirectory(fileType);
    const path = fileType === 'image' ? this.imagesPath : this.soundsPath;

    for (const file of files) {
      fs.unlink(`${path}${file}`, err => {
        if (err) {
          throw err;
        }
      });
    }
  }

  private async importBackup() {
    const filePath = await this.openElectronDialog(
      this.translateService.instant(
        'PAGES.SETTINGS.FORM.FILE_UPLOAD.IMPORT.TITLE'
      ),
      ['openFile'],
      BACKUP_FILTER
    );
    const backupData = await this.readFile(filePath.toString());
    const filename = this.getFileNameWithExtension(filePath);
    await this.writeFile(
      `${this.settingsService.assetsPath}/imported_settings.json`,
      backupData
    );
    const importedData = await this.readFile(
      `${this.settingsService.assetsPath}/settings.json`
    );
    await this.settingsService.updateSettings(JSON.parse(importedData));
  }

  // FIXME currently not working
  private async exportFiles() {
    const directory = await this.openElectronDialog(
      this.translateService.instant(
        'PAGES.SETTINGS.FORM.FILE_UPLOAD.EXPORT.DIALOG_TITLE'
      ),
      ['openDirectory']
    );

    console.log(directory);

    await this.writeFile(
      `${directory}/asdasas.json`,
      JSON.stringify(this.appSettings)
    );
  }

  private async importFiles(type: string) {
    const filter = type === 'image' ? IMAGES_FILTER : SOUNDS_FILTER;
    // Dialog
    const paths = await this.openElectronDialog(
      this.translateService.instant('PAGES.SETTINGS.FORM.FILE_UPLOAD.TITLE'),
      ['openFile', 'multiSelections'],
      filter
    );

    for (let i = 0; i < paths.length; i++) {
      // Read file
      const data = await this.readFile(paths[i]);
      // Write file
      const filename = this.getFileNameWithExtension(paths[i]);
      const writeFilePath = `${
        type === 'image' ? this.imagesPath : this.soundsPath
      }${filename}`;
      await this.writeFile(writeFilePath, data);
    }
  }

  private getFileNameWithExtension(path: string): string {
    return (path.toString().match(/[^\\/]+\.[^\\/]+$/) || []).pop();
  }

  private openElectronDialog(
    title: string,
    properties: any, // No Electron type available
    filter?: {
      name: string;
      extensions: string[];
    }
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      electron.remote.dialog.showOpenDialog(
        {
          title: title,
          properties: properties,
          filters: [filter]
        },
        folderPaths => {
          if (!folderPaths) {
            reject('Could not find folder');
          }
          resolve(folderPaths);
        }
      );
    });
  }

  private validateAllFormFields(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.validateAllFormFields(control);
      }
    });
  }

  private updateForm(settings: AppSettings) {
    this.readFilesFromFileSystem().then(values => {
      this.imageFiles = values[0];
      this.soundFiles = values[1];
      this.patchFormValues(settings);
    });
  }

  private async readFilesFromFileSystem(): Promise<any> {
    return Promise.all([
      this.readFilesFromDirectory('image'),
      this.readFilesFromDirectory('sound')
    ]);
  }

  private readFilesFromDirectory(type: FileType): Promise<string[]> {
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

  private async readFile(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  private async writeFile(path: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, data, err => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  private showSnackbar(message: string, duration: number = 2000) {
    this.snackBar.open(message, undefined, {
      duration
    });
  }

  private patchFormValues(settings: AppSettings): void {
    this.getStandupPickerFormGroup().patchValue({
      background: settings.standupPicker.background,
      standupHour: settings.standupPicker.standupHour,
      standupMinute: settings.standupPicker.standupMinute,
      standupTimeInMin: settings.standupPicker.standupTimeInMin,
      standupEndReminderAfterMin:
        settings.standupPicker.standupEndReminderAfterMin,
      successSound: settings.standupPicker.successSound,
      standupEndReminderSound: settings.standupPicker.standupEndReminderSound
    });

    // First clear existing FormArray
    while (this.standupMusic.length) {
      this.standupMusic.removeAt(this.standupMusic.length - 1);
    }
    // Fill again
    this.getStandupSounds().forEach(sound => {
      this.addNewStandupSound(sound);
    });

    // First clear existing FormArray anf then fill again
    while (this.teamMembers.length) {
      this.teamMembers.removeAt(this.teamMembers.length - 1);
    }
    this.appSettings.standupPicker.teamMembers.forEach(teamMember => {
      this.addNewTeamMemberRow(teamMember.name, teamMember.image);
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
        background: [undefined, Validators.required],
        teamMembers: this.formBuilder.array([]),
        standupMusic: this.formBuilder.array([]),
        standupHour: [
          undefined,
          [Validators.required, Validators.pattern(NUMBER_PATTERN)]
        ],
        standupMinute: [
          undefined,
          [Validators.required, Validators.pattern(NUMBER_PATTERN)]
        ],
        standupTimeInMin: [
          undefined,
          [Validators.required, Validators.pattern(NUMBER_PATTERN)]
        ],
        standupEndReminderAfterMin: [
          undefined,
          [Validators.required, Validators.pattern(NUMBER_PATTERN)]
        ],
        successSound: [undefined, Validators.required],
        standupEndReminderSound: [undefined, Validators.required]
      })
    });
  }

  private createTeamMemberGroup(name?: string, image?: string): FormGroup {
    return this.formBuilder.group({
      name: [name ? name : random_name(), Validators.required],
      image: [
        image
          ? image
          : this.appSettings
            ? this.appSettings.standupPicker.teamMembers[0].image
            : '',
        Validators.required
      ]
    });
  }

  private createStandupSoundGroup(sound: StandupSound): FormGroup {
    return this.formBuilder.group({
      path: sound.path,
      name: sound.name,
      selected: sound.selected
    });
  }
}

export type FileType = 'image' | 'sound';
