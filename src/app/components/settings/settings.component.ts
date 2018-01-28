import { Component, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs/Subscription';

import { AboutDialogComponent } from 'app/components/settings/dialog/about-dialog.component';
import { LeavePageDialogComponent } from 'app/components/settings/dialog/leave-dialog.component';
import { AppSettings } from 'app/models/app-settings';
import { TeamMember } from 'app/models/team-member';
import { SettingsService } from 'app/providers/settings.service';

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
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private settingsService: SettingsService,
    private formBuilder: FormBuilder,
    private router: Router,
    private translateService: TranslateService
  ) {
    const appPath = electron.remote.app.getAppPath();
    this.imagesPath = path
      .join(appPath, '/assets/images/')
      .replace('app.asar', 'app.asar.unpacked');
    this.soundsPath = path
      .join(appPath, '/assets/sounds/')
      .replace('app.asar', 'app.asar.unpacked');

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
    if (this.settingsForm.dirty) {
      console.log(this.settingsForm.dirty);
      const dialogRef = this.dialog.open(LeavePageDialogComponent, {
        width: '500px'
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
        this.translateService.instant('PAGES.SETTINGS.INVALID_FORM')
      );
      return;
    }
    this.settingsService
      .updateSettings({
        standupPicker: this.settingsForm.value.standupPicker
      })
      .then(() => {
        this.showSnackbar(
          this.translateService.instant('PAGES.SETTINGS.SAVE_SUCCESS')
        );
        this.settingsForm.markAsPristine();
      })
      .catch(err => {
        const errorText = this.translateService.instant(
          'PAGES.SETTINGS.SAVE_ERROR'
        );
        this.showSnackbar(`${errorText} ${err}`, 3000);
      });
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

  getNumberErrorMessage(formControlName: string): string | undefined {
    const formControl = this.settingsForm.get(formControlName);
    if (!formControl) {
      return;
    }
    return formControl.hasError('required')
      ? this.translateService.instant(
          'PAGES.STANDUP_PICKER.VALIDATORS.REQUIRED'
        )
      : formControl.hasError('pattern')
        ? this.translateService.instant(
            'PAGES.STANDUP_PICKER.VALIDATORS.NUMBER_PATTERN'
          )
        : '';
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }

  openElectronFilePicker(type: string) {
    this.importFiles(type)
      .then(() => {
        console.log(`Successfully saved ${type}`);
        this.showSnackbar(
          this.translateService.instant(
            'PAGES.SETTINGS.FILE_UPLOAD.IMPORT_SUCCESS'
          )
        );
        this.getImagesAndSounds().then(values => {
          this.imageFiles = values[0];
          this.soundFiles = values[1];
        });
      })
      .catch(err => {
        const errorMessage = this.translateService.instant(
          'PAGES.SETTINGS.FILE_UPLOAD.IMPORT_ERROR'
        );
        this.showSnackbar(`${errorMessage} ${err}`);
      });
  }

  showAboutDialog() {
    const dialogRef = this.dialog.open(AboutDialogComponent, {
      width: '500px'
    });
  }

  importSettings() {
    this.importBackup()
      .then(() => {
        this.showSnackbar(
          this.translateService.instant(
            'PAGES.SETTINGS.FILE_UPLOAD.IMPORT.SUCCESS'
          )
        );
      })
      .catch(err => {
        const errorMessage = this.translateService.instant(
          'PAGES.SETTINGS.FILE_UPLOAD.IMPORT.ERROR'
        );
        this.showSnackbar(`${errorMessage} ${err}`);
      });
  }

  exportSettings() {
    this.exportFiles()
      .then(() => {
        this.showSnackbar(
          this.translateService.instant(
            'PAGES.SETTINGS.FILE_UPLOAD.EXPORT.SUCCESS'
          )
        );
      })
      .catch(err => {
        const errorMessage = this.translateService.instant(
          'PAGES.SETTINGS.FILE_UPLOAD.EXPORT.ERROR'
        );
        this.showSnackbar(`${errorMessage} ${err}`);
      });
  }

  private async importBackup() {
    const filePath = await this.openElectronDialog(
      this.translateService.instant('PAGES.SETTINGS.FILE_UPLOAD.IMPORT.TITLE'),
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

  private async exportFiles() {
    const directory = await this.openElectronDialog(
      this.translateService.instant(
        'PAGES.SETTINGS.FILE_UPLOAD.EXPORT.DIALOG_TITLE'
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
      this.translateService.instant('PAGES.SETTINGS.FILE_UPLOAD.TITLE'),
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
      console.log(field);
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.validateAllFormFields(control);
      }
    });
  }

  private getImagesAndSounds(): Promise<any> {
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

  private createTeamMember(name?: string, image?: string): FormGroup {
    return this.formBuilder.group({
      name: [name ? name : '', Validators.required],
      image: [image ? image : '', Validators.required]
    });
  }
}

export type FileType = 'image' | 'sound';
