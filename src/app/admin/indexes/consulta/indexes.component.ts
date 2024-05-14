import { Component, Input, OnInit } from '@angular/core';
import { IndexInterface } from '../interfaces/indexes.interface';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-indexes',
  templateUrl: './indexes.component.html',
  styleUrls: ['./indexes.component.scss']
})
export class IndexesComponent implements OnInit {
  
  products:IndexInterface[] = [];  
  cols: any[] = [];  
  _selectedColumns: any[] = [];
  _selectedColumnsFilter:any[] = [];
  
  selectedProducts3:IndexInterface[] = [];

  constructor(
    private router:Router,          
    private spinner: NgxSpinnerService,    
    private toastr: ToastrService  
    
  ) { 

    this.cols = [
      { field: 'id_client', header: 'ID', type:"text" },
      { field: 'name_client', header: 'Cliente', type:"text" },        
    ];
  }

  ngOnInit(): void {
    
  }
  
  @Input() get selectedColumns(): any[] {     
    return this._selectedColumns;
  }

  clear(table: Table) {
    table.clear();
    this.selectedProducts3 = [];
  } 

}
