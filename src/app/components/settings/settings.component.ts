import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as random_name from 'node-random-name';
import { take, startWith } from 'rxjs/operators';
import { ElectronService } from '../../providers/electron.service';

import { AboutDialogComponent } from './dialog/about-dialog.component';
import { DeleteFilesDialogComponent } from './dialog/delete-files-dialog.component';
import { AppSettings } from '../../models/app-settings';
import { FileService } from '../../providers/file.service';
import { SettingsService } from '../../providers/settings.service';
import { StandupSound } from '../../models/app-settings';
import { BackupService } from '../../providers/backup.service';
import { ConfirmDialogComponent } from './dialog/confirm-dialog.component';
import { AVAILABLE_LANGUAGES } from '../../app.component';

const DIALOG_WIDTH = '500px';
const WIDE_DIALOG_WIDTH = '80vw';
const ERROR_DURATION_IN_MS = 5000;
const NUMBER_PATTERN = '[0-9]+';
const IMAGES_FILTER = { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] };
const ZIP_FILTER = {
  name: 'Backup',
  extensions: ['zip']
};
const SOUNDS_FILTER = {
  name: 'Sounds',
  extensions: ['wav', 'mp3', 'ogg', 'm4a']
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
  languages = AVAILABLE_LANGUAGES;

  private appSettings: AppSettings;

  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private settingsService: SettingsService,
    private formBuilder: FormBuilder,
    private router: Router,
    private translateService: TranslateService,
    private electronService: ElectronService,
    private fileService: FileService,
    private backupService: BackupService,
    private sanitizer: DomSanitizer
  ) {
    this.imagesPath = electronService.imagesPath;
    this.soundsPath = electronService.soundsPath;

    this.createForm();

    settingsService.setting$
      .pipe(startWith(settingsService.settings))
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

  exportSettings(): void {
    const errText = this.translateService.instant(
      'PAGES.SETTINGS.FORM.FILE_UPLOAD.EXPORT_BACKUP.ERROR'
    );

    this.electronService
      .showSaveDialog(
        this.translateService.instant(
          'PAGES.SETTINGS.FORM.FILE_UPLOAD.EXPORT_BACKUP.TITLE'
        )
      )
      .then(folderPath => {
        this.backupService
          .createBackup(folderPath)
          .then(() => {
            this.showSnackbar(
              this.translateService.instant(
                'PAGES.SETTINGS.FORM.FILE_UPLOAD.EXPORT_BACKUP.SUCCESS',
                { path: folderPath }
              )
            );
          })
          .catch(err => {
            this.showSnackbar(`${errText} ${err}`, ERROR_DURATION_IN_MS);
          });
      })
      .catch(err => {
        this.showSnackbar(`${errText} ${err}`, ERROR_DURATION_IN_MS);
      });
  }

  importSettings(): void {
    const errText = this.translateService.instant(
      'PAGES.SETTINGS.FORM.FILE_UPLOAD.IMPORT_BACKUP.ERROR'
    );

    this.electronService
      .showOpenDialog(
        this.translateService.instant(
          'PAGES.SETTINGS.FORM.FILE_UPLOAD.IMPORT_BACKUP.TITLE'
        ),
        ['openFile'],
        ZIP_FILTER
      )
      .then(folderPaths => {
        this.importBackup(folderPaths[0])
          .then(() => {
            this.showSnackbar(
              this.translateService.instant(
                'PAGES.SETTINGS.FORM.FILE_UPLOAD.IMPORT_BACKUP.SUCCESS'
              )
            );
            this.router.navigate(['../']);
          })
          .catch(err => {
            this.showSnackbar(`${errText} ${err}`, ERROR_DURATION_IN_MS);
          });
      })
      .catch(err => {
        this.showSnackbar(`${errText} ${err}`, ERROR_DURATION_IN_MS);
      });
  }

  deleteFiles(type: FileType): void {
    this.fileService
      .readDirectory(this.getPathForFileType(type))
      .then((files: string[]) => {
        const dialogRef = this.dialog.open(DeleteFilesDialogComponent, {
          width: WIDE_DIALOG_WIDTH,
          data: {
            title: this.translateService.instant(
              `PAGES.SETTINGS.FORM.FILE_UPLOAD.DELETE.DIALOG_${
                type === 'image' ? 'IMAGES' : 'SOUNDS'
              }_TITLE`
            ),
            message: this.translateService.instant(
              `PAGES.SETTINGS.FORM.FILE_UPLOAD.DELETE.DIALOG_${
                type === 'image' ? 'IMAGES' : 'SOUNDS'
              }_MESSAGE`
            ),
            files: files.map(file => {
              return {
                name: file,
                path: `${
                  type === 'image' ? this.imagesPath : this.soundsPath
                }${file}`
              };
            })
          }
        });

        dialogRef
          .afterClosed()
          .pipe(take(1))
          .subscribe(result => {
            if (result === true) {
              this.showSnackbar(
                this.translateService.instant(
                  'PAGES.SETTINGS.FORM.FILE_UPLOAD.DELETE.SUCCESS'
                )
              );
              this.updateForm(this.appSettings);
            } else if (result) {
              const errorText = this.translateService.instant(
                'PAGES.SETTINGS.FORM.FILE_UPLOAD.DELETE.ERROR'
              );
              this.showSnackbar(`${errorText} ${result}`, ERROR_DURATION_IN_MS);
            }
          });
      })
      .catch(err => {
        this.showSnackbar(err, ERROR_DURATION_IN_MS);
      });
  }

  navigateBack(): void {
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
        .pipe(take(1))
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

    // Update translations
    this.translateService.use(this.settingsForm.value.standupPicker.language);

    // Update settings
    this.settingsService.updateSettings({
      version: this.appSettings.version,
      standupPicker: this.settingsForm.value.standupPicker
    });
    this.showSnackbar(
      this.translateService.instant('PAGES.SETTINGS.FORM.SAVE_SUCCESS'),
      3000
    );
    this.settingsForm.markAsPristine();
    this.router.navigate(['../']);
  }

  addNewStandupSound(sound: StandupSound): void {
    const control = <FormArray>(
      this.getStandupPickerFormGroup().controls.standupMusic
    );
    control.push(this.createStandupSoundGroup(sound));
  }

  addNewTeamMemberRow(name?: string, image?: string): void {
    const control = <FormArray>(
      this.getStandupPickerFormGroup().controls.teamMembers
    );
    control.push(this.createTeamMemberGroup(name, image));
  }

  deleteTeamMemberRow(index: number): void {
    const control = <FormArray>(
      this.getStandupPickerFormGroup().controls.teamMembers
    );
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

  openElectronFilePicker(type: string): void {
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

  showAboutDialog(): void {
    const dialogRef = this.dialog.open(AboutDialogComponent, {
      width: DIALOG_WIDTH
    });
  }

  sanitize(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private async importBackup(zipPath: string): Promise<void> {
    await this.backupService.readBackup(zipPath);
  }

  private getPathForFileType(fileType: FileType): string {
    return fileType === 'image' ? this.imagesPath : this.soundsPath;
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

  private async importFiles(type: string): Promise<void> {
    // tslint:disable-next-line:no-shadowed-variable
    const filter = type === 'image' ? IMAGES_FILTER : SOUNDS_FILTER;
    // Dialog
    const paths = await this.electronService.showOpenDialog(
      this.translateService.instant('PAGES.SETTINGS.FORM.FILE_UPLOAD.TITLE'),
      ['openFile', 'multiSelections'],
      filter
    );

    for (let i = 0; i < paths.length; i++) {
      // Read file
      const data = await this.fileService.readFile(paths[i]);
      // Write file
      const filename = this.getFileNameWithExtension(paths[i]);
      const writeFilePath = `${
        type === 'image' ? this.imagesPath : this.soundsPath
      }${filename}`;
      await this.fileService.writeFile(writeFilePath, data);
    }
  }

  private getFileNameWithExtension(path: string): string {
    return (path.toString().match(/[^\\/]+\.[^\\/]+$/) || []).pop();
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

  private updateForm(settings: AppSettings): void {
    this.readFilesFromFileSystem().then(values => {
      this.imageFiles = values[0];
      this.soundFiles = values[1];
      this.patchFormValues(settings);
    });
  }

  private async readFilesFromFileSystem(): Promise<[any, any]> {
    return Promise.all([
      this.fileService.readDirectory(this.getPathForFileType('image')),
      this.fileService.readDirectory(this.getPathForFileType('sound'))
    ]);
  }

  private showSnackbar(message: string, duration: number = 2000): void {
    this.snackBar.open(message, undefined, {
      duration
    });
  }

  private patchFormValues(settings: AppSettings): void {
    this.getStandupPickerFormGroup().patchValue({
      language: settings.standupPicker.language,
      background: settings.standupPicker.background,
      standupHour: settings.standupPicker.standupHour,
      standupMinute: settings.standupPicker.standupMinute,
      standupTimeInMin: settings.standupPicker.standupTimeInMin,
      standupEndReminderAfterMin:
        settings.standupPicker.standupEndReminderAfterMin,
      successSound: settings.standupPicker.successSound,
      standupEndReminderSound: settings.standupPicker.standupEndReminderSound
    });

    // First clear existing FormArray and then fill again
    while (this.standupMusic.length) {
      this.standupMusic.removeAt(this.standupMusic.length - 1);
    }
    this.getStandupSounds().forEach(sound => {
      this.addNewStandupSound(sound);
    });

    // First clear existing FormArray and then fill again
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

  private createForm(): void {
    this.settingsForm = this.formBuilder.group({
      standupPicker: this.formBuilder.group({
        language: [this.translateService.currentLang],
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
    const memberWithPlaceHolderImage = this.imageFiles.find(file =>
      file.includes('placeholder.png')
    );
    const placeholderImage = `${this.imagesPath}${memberWithPlaceHolderImage}`;

    return this.formBuilder.group({
      name: [name ? name : random_name(), Validators.required],
      image: [image ? image : placeholderImage, Validators.required]
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
