import { Component, Input, OnInit } from '@angular/core';
import { ClientInterface } from '../interfaces/clients.interface';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ClientsService } from '../services/clients.service';
import { MatDialog } from '@angular/material/dialog';
import { EditClientsDialog } from '../edit/edit-clients.component';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',  
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  
  products:ClientInterface[] = [];  
  cols: any[] = [];  
  _selectedColumns: any[] = [];
  _selectedColumnsFilter:any[] = [];
  
  selectedProducts3:ClientInterface[] = [];

  constructor(
    private router:Router,          
    private spinner: NgxSpinnerService,    
    private toastr: ToastrService,  
    private wsClient:ClientsService,
    public dialog: MatDialog
    
  ) { 

    this.cols = [
      { field: 'id_client', header: 'ID', type:"text" },
      { field: 'name_client', header: 'Cliente', type:"text" },        
    ];
  }

  ngOnInit(): void {
    this.products = [
      {id_client: 1, name_client: 'Prueba 1'},
      {id_client: 2, name_client: 'Prueba 2'},
      {id_client: 3, name_client: 'Prueba 3'},
      {id_client: 4, name_client: 'Prueba 4'},
    ];
  }
  
  @Input() get selectedColumns(): any[] {     
    return this._selectedColumns;
  }

  clear(table: Table) {
    table.clear();
    this.selectedProducts3 = [];
  } 

  openDialog(flag:string, row:any) {
    const dialogRef = this.dialog.open(EditClientsDialog, {
      height: 'auto',
      width: '90%',
      maxWidth:'95%',
      autoFocus:true,
      disableClose:true,
      data: {
        tipo: flag,
        data: row
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });    
  }
 

}
