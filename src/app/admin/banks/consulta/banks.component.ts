import { Component, Input, OnInit } from '@angular/core';
import { BankInterface } from '../interfaces/banks.interface';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { BanksService } from '../services/banks.service';
import { AddBankDialogComponent } from '../detalle/addBank.component';


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
  // banksService: any;
  selectedProducts3:BankInterface[] = [];

  banks: any;
  dialog: any;

  constructor(
    private router: Router,          
    private spinner: NgxSpinnerService,    
    private toastr: ToastrService,  
    private banksService: BanksService
) { 
    this.cols = [
        { field: 'id_bank', header: 'ID Bank' },
        { field: 'bank', header: 'Bank Name' },
        { field: 'CSA', header: 'CSA Status' }
    ];
    this._selectedColumns = this.cols;
}


ngOnInit(): void {
  this.spinner.show(); // Show spinner before loading data
  this.banksService.getBanks().subscribe({
      next: (data) => {
          this.products = data; // Assuming 'data' is the array of banks
          this.spinner.hide(); // Hide spinner after data is loaded
      },
      error: (error) => {
          console.error('Failed to fetch banks', error);
          this.toastr.error('Failed to load banks');
          this.spinner.hide(); // Hide spinner also on error
      }
  });
}

  
  @Input() get selectedColumns(): any[] {     
    return this._selectedColumns;
  }

  clear(table: Table) {
    table.clear();
    this.selectedProducts3 = []; //
  } 

  openDialog(): void {
    const dialogRef = this.dialog.open(AddBankDialogComponent, {
      width: '250px',
      data: {name: 'Angular', animal: 'Unicorn'} // Pass any data you need
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
      // Handle data from dialog here if needed
    });
  }

}
