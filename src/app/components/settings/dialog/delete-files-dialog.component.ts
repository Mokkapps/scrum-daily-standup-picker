import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as fs from 'fs';

@Component({
  selector: 'app-delete-files-dialog',
  templateUrl: 'delete-files-dialog.component.html',
  styleUrls: ['delete-files-dialog.component.scss']
})
export class DeleteFilesDialogComponent {
  title: string;

  message: string;

  files: FileCheckbox[];

  constructor(
    public dialogRef: MatDialogRef<DeleteFilesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.message = data.message;
    this.files = data.files.map(file => {
      return {
        name: file.name,
        path: file.path,
        checked: false
      };
    });
  }

  onYesClick(): void {
    const filesToDelete = this.files.filter(file => file.checked);

    if (filesToDelete.length > 0) {
      const deletePromises = filesToDelete.map(file =>
        this.deleteFiles(file.path)
      );
      Promise.all(deletePromises)
        .then(() => {
          this.dialogRef.close(true);
        })
        .catch(err => {
          this.dialogRef.close(err);
        });
    } else {
      this.dialogRef.close();
    }
  }

  private async deleteFiles(filePath: string) {
    return new Promise((resolve, reject) => {
      fs.access(filePath, error => {
        if (!error) {
          fs.unlink(filePath, function(error) {
            if (!error) {
              resolve();
            } else {
              console.log(error);
              reject(error);
            }
          });
        } else {
          console.log(error);
          reject(error);
        }
      });
    });
  }
}

interface FileCheckbox {
  name: string;
  path: string;
  checked: boolean;
}
