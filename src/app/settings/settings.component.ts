import { Component, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { AppSettings } from 'app/models/app-settings';
import { TeamMember } from 'app/models/team-member';
import { SettingsService } from 'app/settings/settings.service';
import { readFile } from 'jsonfile';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

// see https://github.com/electron/electron/issues/7300
// const electron = (<any>window).require('electron');
// const fs = (<any>window).require('fs');

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnDestroy {
  settings: Observable<AppSettings>;

  settingsForm: FormGroup;

  teamMembers: TeamMember[];

  slideshowURLs: string[];

  standupMusic: string[];

  private appSettings: AppSettings;
  private settingsSubscription: Subscription;

  constructor(
    private settingsService: SettingsService,
    private formBuilder: FormBuilder
  ) {
    console.log('Init SettingsComponent');

    this.createForm();

    this.settings = settingsService.settings;
    settingsService.settings.subscribe(settings => {
      this.appSettings = settings;

      // Patch values
      this.settingsForm.patchValue({
        jiraUrl: settings.jiraUrl,
        slideshowTimer: settings.slideshow.timerInSec
      });

      // Update team members
      this.teamMembers = this.appSettings.standupPicker.teamMembers;
      this.teamMembers.forEach(teamMember => {
        this.addNewTeamMemberRow(
          teamMember.name,
          teamMember.imageUrl,
          teamMember.role
        );
      });
      // Update slideshow URLs
      this.slideshowURLs = this.appSettings.slideshow.urls;
      this.slideshowURLs.forEach(url => {
        this.addNewSlideshowUrlRow(url);
      });
      // Update standup music paths
      this.standupMusic = this.appSettings.standupPicker.standupMusic;
      this.standupMusic.forEach(path => {
        this.addNewStandupMusicPathRow(path);
      });
    });
  }

  onSubmit() {
    console.log('SUBMIT');
    // this.settingsService.updateSettings({
    //   teamMembers: this.settingsForm.value.teamMembers,
    //   jiraUrl: this.settingsForm.value.jiraUrl,
    //   slideshowTimeInSec: this.settingsForm.value.slideshowTimer,
    //   slideshowURLs: this.settingsForm.value.slideshowURLs,
    //   standupMusic: this.settingsForm.value.standupMusic
    // });
  }

  revert() {
    console.log('REVERT');
    // this.settingsForm.setValue({});
  }

  addNewTeamMemberRow(name?: string, imageUrl?: string, role?: string) {
    // control refers to your formarray
    const control = <FormArray>this.settingsForm.controls.teamMembers;
    // add new formgroup
    control.push(this.createTeamMember(name, imageUrl, role));
    console.log(this.settingsForm);
  }

  deleteTeamMemberRow(index: number) {
    const control = <FormArray>this.settingsForm.controls.teamMembers;
    control.removeAt(index);
  }

  addNewSlideshowUrlRow(url?: string) {
    const control = <FormArray>this.settingsForm.controls.slideshowURLs;
    control.push(this.createSlideshowURL(url));
  }

  deleteSlideshowUrlRow(index: number) {
    const control = <FormArray>this.settingsForm.controls.slideshowURLs;
    control.removeAt(index);
  }

  addNewStandupMusicPathRow(path?: string) {
    const control = <FormArray>this.settingsForm.controls.standupMusic;
    control.push(this.createStandupMusicPath(path));
  }

  deleteStandupMusicPathRow(index: number) {
    const control = <FormArray>this.settingsForm.controls.standupMusic;
    control.removeAt(index);
  }

  ngOnDestroy() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }

  openElectronWindow() {
    // electron.remote.dialog.showOpenDialog(
    //   {
    //     title: 'Select a image',
    //     properties: ['openFile'],
    //     filters: [{ name: 'Images', extensions: ['jpg', 'png'] }]
    //   },
    //   folderPath => {
    //     if (folderPath === undefined) {
    //       console.warn('You did not select an image');
    //       return;
    //     }
    //     console.log(`Selected image path ${folderPath}`);
    //     fs.readFile(folderPath.toString(), (err, data) => {
    //       if (err) {
    //         console.error(`Error reading file from ${folderPath}: ${err}`);
    //         return;
    //       }
    //       console.log(data);
    //       // tslint:disable-next-line:no-shadowed-variable
    //       fs.writeFile('test.png', data, (err) => {
    //         if (err) {
    //           throw err;
    //         }
    //         console.log('It iss saved!');
    //        });
    //     });
    //   }
    // );
  }

  private createForm() {
    this.settingsForm = this.formBuilder.group({
      jiraUrl: '',
      teamMembers: this.formBuilder.array([]),
      slideshowTimer: 30 * 1000,
      slideshowURLs: this.formBuilder.array([]),
      standupMusic: this.formBuilder.array([])
    });
  }

  private createTeamMember(name?: string, imageUrl?: string, role?: string) {
    return this.formBuilder.group({
      name: name ? name : 'Bitte Namen eintragen',
      imageUrl: imageUrl ? imageUrl : 'Bildpfad angeben',
      role: role ? role : 'Rolle eingeben'
    });
  }

  private createSlideshowURL(url?: string) {
    return this.formBuilder.group({
      url: url ? url : 'https://www.mokkapps.de'
    });
  }

  private createStandupMusicPath(path?: string) {
    return this.formBuilder.group({
      path: path ? path : '/assets/sounds/cheerful-song.wav'
    });
  }
}
