import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';

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
  selector: 'app-choose-dialog',
  templateUrl: 'choose-dialog.component.html',
  styleUrls: ['choose-dialog.component.scss']
})
export class ChooseDialogComponent {
  type: File;

  files: string[];

  directory: string;

  selected: string;

  constructor(
    public dialogRef: MatDialogRef<ChooseDialogComponent>,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.directory = data.type === 'image' ? IMAGES_PATH : SOUNDS_PATH;
    this.type = data.type;
    this.readFiles();
  }

  playSound(): void {
    console.log('Play sound: ' + this.selected);
    const audio = new Audio();
    audio.src = `.${this.directory}${this.selected}`;
    audio.load();
    audio.play();
  }

  closeDialog(): void {
    console.log('Selected file', this.selected);
    this.dialogRef.close(`.${this.directory}${this.selected}`);
  }

  openElectronFilePicker(): void {
    const filter = this.type === 'image' ? IMAGES_FILTER : SOUNDS_FILTER;
    electron.remote.dialog.showOpenDialog(
      {
        title: 'Select a image',
        properties: ['openFile'],
        filters: [filter]
      },
      folderPath => {
        if (folderPath === undefined) {
          console.warn(`You did not select a ${this.type}`);
          return;
        }
        console.log(`Selected ${this.type} path ${folderPath}`);
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
            `${DIST_PATH}${this.directory}${filename}`,
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
              console.log(`Successfully saved ${this.type}`);
              this.snackBar.open('Datei erfolgreich gespeichert', undefined, {
                duration: 2000
              });
              this.readFiles();
            }
          );
        });
      }
    );
  }

  private readFiles(): void {
    fs.readdir(`${DIST_PATH}${this.directory}`, (err, files) => {
      this.files = files;
    });
  }
}

export type File = 'image' | 'sound';
