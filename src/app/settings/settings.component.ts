import { Component, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AppSettings } from 'app/models/app-settings';
import { TeamMember } from 'app/models/team-member';
import { SettingsService } from 'app/settings/settings.service';
import { readFile } from 'jsonfile';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ChooseDialogComponent } from './../choose-dialog/choose-dialog.component';

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
    public dialog: MatDialog,
    public snackBar: MatSnackBar
  ) {
    console.log('Init SettingsComponent');

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

  openDialog(type: string): void {
    const dialogRef = this.dialog.open(ChooseDialogComponent, {
      width: '500px',
      data: { type }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed with ' + result);
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
