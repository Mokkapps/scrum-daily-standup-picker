import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ElectronService } from 'app/providers/electron.service';

const GITHUB_URL = 'https://github.com/Mokkapps/scrum-daily-standup-picker';
const MOKKAPPS_URL = 'https://www.mokkapps.de';

@Component({
  selector: 'app-about-dialog',
  templateUrl: 'about-dialog.component.html',
  styleUrls: ['about-dialog.component.scss']
})
export class AboutDialogComponent {
  appVersion: string;
  year: number;

  constructor(
    public dialogRef: MatDialogRef<AboutDialogComponent>,
    private electronService: ElectronService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.appVersion = electronService.appVersion;
    this.year = new Date().getFullYear();
  }

  openGitHubUrl() {
    this.electronService.openExternal(GITHUB_URL);
  }

  openMokkappsUrl() {
    this.electronService.openExternal(MOKKAPPS_URL);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
