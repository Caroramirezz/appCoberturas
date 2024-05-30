import { Component, Input, OnInit } from '@angular/core';
import { IndexInterface } from '../interfaces/indexes.interface';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { IndexService } from  '../services/index.service';
import { MatDialog } from '@angular/material/dialog';
import { AddIndexComponent } from '../add/addIndex.component';


@Component({
  selector: 'app-indexes',
  templateUrl: './index.component.html',  
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  
  products:IndexInterface[] = [];  
  cols: any[] = [];  
  _selectedColumns: any[] = [];
  _selectedColumnsFilter:any[] = [];
  // banksService: any;
  selectedProducts3:IndexInterface[] = [];

  index: any;

  constructor(
    private router: Router,          
    private spinner: NgxSpinnerService,    
    private toastr: ToastrService,  
    private indexService: IndexService,
    public dialog: MatDialog,
) { 
    this.cols = [
        { field: 'id_index', header: 'ID Bank' },
        { field: 'index_name', header: 'Index Name' },
        { field: 'index_symbol', header: 'Index Symbol' },
        { field: 'source', header: 'Source' },
    ];
    this._selectedColumns = this.cols;
}

openAddIndexDialog(): void {
  const dialogRef = this.dialog.open(AddIndexComponent, {
      width: '250px'
  });

  dialogRef.afterClosed().subscribe(result => {
      if (result) {
          this.indexService.addIndex(result).subscribe({
              next: (newIndex) => {
                  this.products.push(newIndex);
                  this.toastr.success('Index added successfully');
              },
              error: (error) => {
                  this.toastr.error('Error adding index', error.message);
              }
          });
      }
  });
}

ngOnInit(): void {
  this.spinner.show(); // Show spinner before loading data
  this.indexService.getIndexes().subscribe({
      next: (data) => {
        console.log("Received index data:", data);
          this.products = data; // Assuming 'data' is the array of banks
          console.log("Products set in component:", this.products); 
          this.spinner.hide(); // Hide spinner after data is loaded
      },
      error: (error) => {
          console.error('Failed to fetch indexes', error);
          this.toastr.error('Failed to load indexes');
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

  deleteIndex(id: number): void {
    this.indexService.deleteIndex(id).subscribe({
        next: (res) => {
            this.products = this.products.filter(product => product.id_index !== id);
            this.toastr.success('Index successfully deleted.');
        },
        error: (err) => {
            this.toastr.error('Failed to delete index. ' + err.message);
            console.error('Failed to delete index', err);
        }
    });
  }

  toggleEdit(index: IndexInterface, value: boolean): void {
    index.editing = value; // Toggle edit state
}

saveIndex(index: IndexInterface): void {
    this.indexService.updateIndex(index).subscribe({
        next: () => {
            this.toastr.success('Bank updated successfully!');
            index.editing = false; 
        },
        error: (error) => {
            this.toastr.error('Error updating index');
            console.error('Error updating index', error);
        }
    });
}
}
