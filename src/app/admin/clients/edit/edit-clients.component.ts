import { Component, Inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'dialog-data-example-dialog',
  templateUrl: './edit-clients.component.html',
  styleUrls: ['./edit-clients.component.scss']  
})
export class EditClientsDialog {

  variable:any = "";
  public formNew:FormGroup;

  constructor(public dialogRef: MatDialogRef<EditClientsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    public fb: FormBuilder, 
  ) {

    this.variable = data.tipo;

    this.formNew = this.fb.group({
      'name_client': new FormControl(null, [Validators.required]),
      'group_client': new FormControl(null, [Validators.required]),
      'holding': new FormControl(null, [Validators.required]),
    }); 
  }


  ngOnInit(): void {
   
  }

  cancelar(): void {
    this.dialogRef.close(0);
  }

  guardar(){    
    this.dialogRef.close(1);
  }

} 
  



