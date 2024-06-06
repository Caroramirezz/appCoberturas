import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-addSar',
  templateUrl: './addSar.component.html',
  styleUrls: ['./addSar.component.scss']
})
export class AddSarComponent implements OnInit {
  sarForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddSarComponent>) { }

  ngOnInit(): void {
    this.sarForm = this.fb.group({
      sarNum: ['', Validators.required],
      description : ['', Validators.required],
      fecha_incio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.sarForm.valid) {
      this.dialogRef.close(this.sarForm.value);
    }
  }
}
