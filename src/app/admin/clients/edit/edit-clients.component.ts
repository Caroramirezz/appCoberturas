import { Component, Inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'dialog-data-example-dialog',
  templateUrl: './edit-clients.component.html',
  styleUrls: ['./edit-clients.component.scss']  
})
export class EditClientsDialog {

  variable:any = "";
  constructor(public dialogRef: MatDialogRef<EditClientsDialog>,
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
  



