import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-addBank',
  templateUrl: './addBank.component.html',
  styleUrls: ['./addBank.component.scss']
})
export class AddBankDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AddBankDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
