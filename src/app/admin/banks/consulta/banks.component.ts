import { Component, Input, OnInit } from '@angular/core';
import { BankInterface } from '../interfaces/banks.interface';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { BanksService } from '../services/banks.service';
import { MatDialog } from '@angular/material/dialog';
import { AddBankComponent } from '../add/addBank.component';

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

  constructor(
    private router: Router,          
    private spinner: NgxSpinnerService,    
    private toastr: ToastrService,  
    private banksService: BanksService,
    public dialog: MatDialog,
) { 
    this.cols = [
        { field: 'id_bank', header: 'ID Bank' },
        { field: 'bank', header: 'Bank Name' },
        { field: 'csa', header: 'CSA Status' }
    ];
    this._selectedColumns = this.cols;
}

openAddBankDialog(): void {
  const dialogRef = this.dialog.open(AddBankComponent, {
    width: '250px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.banksService.addBank(result).subscribe({
        next: (response) => {
          this.toastr.success('Bank added successfully');
        },
        error: (error) => {
          console.error('Error adding bank:', error);
          this.toastr.error('Error adding bank');
        }
      });
    }
  });
}



ngOnInit(): void {
  this.spinner.show(); // Show spinner before loading data
  this.banksService.getBanks().subscribe({
      next: (data) => {
        console.log("Received banks data:", data);
          this.products = data; // Assuming 'data' is the array of banks
          console.log("Products set in component:", this.products); 
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

  deleteBank(id: number): void {
    this.banksService.deleteBank(id).subscribe({
        next: (res) => {
            this.products = this.products.filter(product => product.id_bank !== id);
            this.toastr.success('Bank successfully deleted.');
        },
        error: (err) => {
            this.toastr.error('Failed to delete bank. ' + err.message);
            console.error('Failed to delete bank', err);
        }
    });
  }
}