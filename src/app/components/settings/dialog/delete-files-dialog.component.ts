import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { FileService } from '../../../providers/file.service';

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
    private fileService: FileService,
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

    console.log(data);
  }

  onYesClick(): void {
    const filesToDelete = this.files.filter(file => file.checked);

    console.log(this.files);
    console.log(filesToDelete);

    if (filesToDelete.length > 0) {
      const deletePromises = filesToDelete.map(file =>
        this.fileService.deleteFile(file.path)
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
}

interface FileCheckbox {
  name: string;
  path: string;
  checked: boolean;
}
