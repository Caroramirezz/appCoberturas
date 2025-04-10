import { Component, Input, OnInit } from '@angular/core';
import { IndexInterface } from '../interfaces/indexes.interface';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { IndexService } from  '../services/index.service';
import { MatDialog } from '@angular/material/dialog';
import { AddDialogComponent } from '../../add-dialog/add-dialog.component';

@Component({
  selector: 'app-indexes',
  templateUrl: './index.component.html',  
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  
  products: IndexInterface[] = [];  
  filteredIndex: IndexInterface[] = [];
  cols: any[] = [];  
  _selectedColumns: any[] = [];
  _selectedColumnsFilter: any[] = [];
  selectedProducts3: IndexInterface[] = [];

  index: any;

  constructor(
    private router: Router,          
    private spinner: NgxSpinnerService,    
    private toastr: ToastrService,  
    private indexService: IndexService,
    public dialog: MatDialog,
  ) { 
    // Define las columnas necesarias
    this.cols = [
      { field: 'id_index', header: 'ID Bank' },
      { field: 'index_name', header: 'Index' },
      { field: 'index_symbol_P', header: 'Ticker Platts' },
      { field: 'index_symbol_B', header: 'Ticker Bloomberg' },
      { field: 'index_symbol_Neg', header: 'Ticker Neg' }
    ];
    this._selectedColumns = this.cols;
  }

  // Método para abrir el diálogo para agregar un índice
  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      width: '250px',
      data: {
        title: 'Index',
        fields: [
          { name: 'index_name', label: 'Index' },
          { name: 'index_symbol_P', label: 'Ticker Platts' },
          { name: 'index_symbol_B', label: 'Ticker Bloomberg' },
          { name: 'index_symbol_Neg', label: 'Ticker Neg' }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result) {
        //if (!result.index_symbol_P || !result.index_symbol_B || !result.index_symbol_Neg) {
        //  this.toastr.error('At least one ticker (Platts or Bloomberg) must be provided.');
        //  return;
        //}

        this.indexService.addIndex(result).subscribe({
          next: (newIndex) => {
            this.products.push(newIndex);
            this.filteredIndex.push(newIndex);
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
    this.spinner.show(); 
    this.indexService.getIndexes().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredIndex = [...data];
        this.spinner.hide();
      },
      error: (error) => {
        this.toastr.error('Failed to load indexes');
        this.spinner.hide();
      }
    });
  }

  @Input() get selectedColumns(): any[] {     
    return this._selectedColumns;
  }

  clear(table: Table) {
    table.clear();
    this.selectedProducts3 = []; 
  } 

  deleteIndex(id: number): void {
    this.indexService.deleteIndex(id).subscribe({
      next: (res) => {
        this.products = this.products.filter(product => product.id_index !== id);
        this.filteredIndex = this.filteredIndex.filter(product => product.id_index !== id);
        this.toastr.success('Index successfully deleted.');
      },
      error: (err) => {
        this.toastr.error('Failed to delete index. ' + err.message);
        console.error('Failed to delete index', err);
      }
    });
  }

  toggleEdit(index: IndexInterface, value: boolean): void {
    index.editing = value;
  }

  saveIndex(index: IndexInterface): void {
    this.indexService.updateIndex(index).subscribe({
      next: () => {
        this.toastr.success('Index updated successfully!');
        index.editing = false; 
      },
      error: (error) => {
        this.toastr.error('Error updating index');
        console.error('Error updating index', error);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredIndex = this.products.filter((index) => {
      return Object.values(index).some((value) =>
        value && value.toString().toLowerCase().includes(filterValue)
      );
    });
  }
}