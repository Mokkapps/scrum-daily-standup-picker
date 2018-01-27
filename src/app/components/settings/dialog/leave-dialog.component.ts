import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-leave-dialog',
  templateUrl: 'leave-dialog.component.html'
})
export class LeavePageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LeavePageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
