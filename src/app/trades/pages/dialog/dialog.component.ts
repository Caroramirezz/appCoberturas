import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  idSP:string = "";
  montoSP:number=0;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
  ) { 
    
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
