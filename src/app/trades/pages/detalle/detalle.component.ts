import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TradeInterface } from '../../interfaces/trade.interface';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class DetalleComponent implements OnInit {

  

  constructor(
    private activatedRoute:ActivatedRoute,
    private router:Router,
    private dialogRef: MatDialogRef<DetalleComponent>,
    @Inject(MAT_DIALOG_DATA) dataDialog:any,
    private toastr: ToastrService,              
    public dialog: MatDialog,
    ) 
    {
      
    }

  ngOnInit(): void { 
   
  }

  
  onClickCancelar(): void {
    this.dialogRef.close();
  }   

}
