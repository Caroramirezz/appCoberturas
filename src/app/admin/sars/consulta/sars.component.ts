import { Component, OnInit, Input } from '@angular/core';
import { SarsInterface } from '../interfaces/sars.interface';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { SarsService } from '../services/sars.service';
import { MatDialog } from '@angular/material/dialog';
import { AddDialogComponent } from '../../add-dialog/add-dialog.component';

@Component({
  selector: 'app-sars',
  templateUrl: './sars.component.html',
  styleUrls: ['./sars.component.scss']
})
export class SarsComponent implements OnInit {
  products: SarsInterface[] = [];
  filteredSars: SarsInterface[] = [];
  cols: any[] = [];
  _selectedColumns: any[] = [];
  _selectedColumnsFilter: any[] = [];
  selectedProducts3: SarsInterface[] = [];

  sars: any;

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private sarsService: SarsService,
    public dialog: MatDialog,
  ) {
    this.cols = [
      { field: 'id_sar', header: 'ID Index' },
      { field: 'number_sar', header: 'Nombre' },
      { field: 'description', header: 'Descripción' },
      { field: 'fecha_inicio', header: 'Fecha Inicio' },
      { field: 'fecha_fin', header: 'Fecha Fin' },
    ];
    this._selectedColumns = this.cols;
  }

  openAddSarDialog(): void {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      width: '400px',
      data: {
        title: 'SAR',
        fields: [
          { name: 'number_sar', label: 'SAR Number' },
          { name: 'description', label: 'Description' },
          { name: 'fecha_inicio', label: 'Start Date' },
          { name: 'fecha_fin', label: 'End Date' }
        ]
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sarsService.addSars(result).subscribe({
          next: (newSar) => {
            this.products.push(newSar);
            this.filteredSars.push(newSar);
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
    this.spinner.show();
    this.sarsService.getSars().subscribe({
      next: (data) => {
        console.log("Received sars data:", data);
        this.products = data;
        this.filteredSars = [...data];
        console.log("Products set in component:", this.products);
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Failed to fetch sars', error);
        this.toastr.error('Failed to load sars');
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

  deleteSars(id: number): void {
    this.sarsService.deleteSars(id).subscribe({
      next: (res) => {
        this.products = this.products.filter(product => product.id_sar !== id);
        this.filteredSars = this.filteredSars.filter(product => product.id_sar !== id);
        this.toastr.success('Sars successfully deleted.');
      },
      error: (err) => {
        this.toastr.error('Failed to delete sars. ' + err.message);
        console.error('Failed to delete sars', err);
      }
    });
  }

  toggleEdit(sar: SarsInterface, value: boolean): void {
    sar.editing = value;
  }

  saveSar(sar: SarsInterface): void {
    this.sarsService.updateSar(sar).subscribe({
      next: () => {
        this.toastr.success('Sar updated successfully!');
        sar.editing = false; 
      },
      error: (error) => {
        this.toastr.error('Error updating sar');
        console.error('Error updating sar', error);
      }
    });
  }  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredSars = this.products.filter((sar) => {
      return Object.values(sar).some((value) =>
        value && value.toString().toLowerCase().includes(filterValue)
      );
    });
  }
}
