import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-addBank',
  templateUrl: './addBank.component.html',
  styleUrls: ['./addBank.component.scss']
})
export class AddBankComponent implements OnInit {
  bankForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddBankComponent>) { }

  ngOnInit(): void {
    this.bankForm = this.fb.group({
      bank: ['', Validators.required],
      CSA: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.bankForm.valid) {
      this.dialogRef.close(this.bankForm.value);
    }
  }
}
