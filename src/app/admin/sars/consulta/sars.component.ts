import { Component, Input, OnInit } from '@angular/core';
import { SarsInterface } from '../interfaces/sars.interface';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { SarsService } from '../services/sars.service';
import { MatDialog } from '@angular/material/dialog';
import { AddSarComponent } from '../add/addSar.component';

@Component({
  selector: 'app-sars',
  templateUrl: './sars.component.html',  
  styleUrls: ['./sars.component.scss']
})
export class SarsComponent implements OnInit {
  
  products:SarsInterface[] = [];  
  cols: any[] = [];  
  _selectedColumns: any[] = [];
  _selectedColumnsFilter:any[] = [];
  selectedProducts3:SarsInterface[] = [];

  sars: any;

  constructor(
    private router: Router,          
    private spinner: NgxSpinnerService,    
    private toastr: ToastrService,  
    private sarsService: SarsService,
    public dialog: MatDialog,
) { 
    this.cols = [
        { field: 'id_bank', header: 'ID Bank' },
        { field: 'bank', header: 'Bank Name' },
        { field: 'csa', header: 'CSA Status' }
    ];
    this._selectedColumns = this.cols;
}

openAddSarDialog(): void {
  const dialogRef = this.dialog.open(AddSarComponent, {
      width: '250px'
  });

  dialogRef.afterClosed().subscribe(result => {
      if (result) {
          this.sarsService.addSars(result).subscribe({
              next: (newSar) => {
                  this.products.push(newSar);
                  this.toastr.success('Sar added successfully');
              },
              error: (error) => {
                  this.toastr.error('Error adding sar', error.message);
              }
          });
      }
  });
}

ngOnInit(): void {
  this.spinner.show(); // Show spinner before loading data
  this.sarsService.getSars().subscribe({
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

  deleteSars(id: number): void {
    this.sarsService.deleteSars(id).subscribe({
        next: (res) => {
            this.products = this.products.filter(product => product.id_sar !== id);
            this.toastr.success('Sars successfully deleted.');
        },
        error: (err) => {
            this.toastr.error('Failed to delete sars. ' + err.message);
            console.error('Failed to delete sars', err);
        }
    });
  }
  
}
