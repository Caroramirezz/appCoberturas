import { Component, Input, OnInit } from '@angular/core';
import { BankInterface } from './interfaces/banks.interface';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { BanksService } from './services/banks.service';

@Component({
  selector: 'app-clients',
  templateUrl: './banks.component.html',  
  styleUrls: ['./banks.component.scss']
})
export class BanksComponent implements OnInit {
  
  products:BankInterface[] = [];  
  cols: any[] = [];  
  _selectedColumns: any[] = [];
  _selectedColumnsFilter:any[] = [];
  
  selectedProducts3:BankInterface[] = [];
  banksService: any;
  banks: any;

  constructor(
    private router:Router,          
    private spinner: NgxSpinnerService,    
    private toastr: ToastrService,  
    
  ) { 

    this.cols = [
      { field: 'id_bank', header: 'bank', type:"CSA" },
    ];
  }

  ngOnInit(): void {
    this.banksService.getBanks().subscribe({
    });
  }
  
  @Input() get selectedColumns(): any[] {     
    return this._selectedColumns;
  }

  clear(table: Table) {
    table.clear();
    this.selectedProducts3 = [];
  } 

}
