import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-addBank',
  templateUrl: './addBank.component.html',
  styleUrls: ['./addBank.component.scss']
})
export class AddBankComponent implements OnInit {
  bankForm: FormGroup = new FormGroup({});

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddBankComponent>
  ) { 
    this.bankForm = this.fb.group({
      bank: ['', Validators.required],
      CSA: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Remove the initialization of bankForm here
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.bankForm.valid) {
      this.dialogRef.close(this.bankForm.value);
    }
  }
}
