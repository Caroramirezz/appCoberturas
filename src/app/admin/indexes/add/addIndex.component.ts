import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-addIndex',
  templateUrl: './addIndex.component.html',
  styleUrls: ['./addIndex.component.scss']
})
export class AddIndexComponent implements OnInit {
  indexForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddIndexComponent>) { }

  ngOnInit(): void {
    this.indexForm = this.fb.group({
      index_name: ['', Validators.required],
      index_symbol: ['', Validators.required],
      source: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.indexForm.valid) {
      this.dialogRef.close(this.indexForm.value);
    }
  }
}
