import { Component, Inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'dialog-data-example-dialog',
  templateUrl: './edit-banks.component.html',
  styleUrls: ['./edit-banks.component.scss']  
})
export class EditBanksDialog {

    variable:any = "";
    constructor(public dialogRef: MatDialogRef<EditBanksDialog>,
      @Inject(MAT_DIALOG_DATA) public data: any,) {
  
      this.variable = data.tipo;
    }
  
  
    ngOnInit(): void {
     
    }
  
    cancelar(): void {
      this.dialogRef.close(0);
    }
  
    aceptar(){
      this.dialogRef.close(1);
    }
  
  } 