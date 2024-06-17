import { Component, Input, OnInit } from '@angular/core';
import { BankInterface } from '../interfaces/banks.interface';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { BanksService } from '../services/banks.service';
import { MatDialog } from '@angular/material/dialog';
import { AddDialogComponent } from '../../add-dialog/add-dialog.component';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.component.html',
  styleUrls: ['./banks.component.scss']
})
export class BanksComponent implements OnInit {

  products: BankInterface[] = [];
  filteredBanks: BankInterface[] = [];
  cols: any[] = [];
  _selectedColumns: any[] = [];
  selectedProducts3: BankInterface[] = [];

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
      { field: 'csa', header: 'CSA Status' },
      { field: 'threshold', header: 'Threshold' },
    ];
    this._selectedColumns = this.cols;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      width: '250px',
      data: {
        title: 'Bank',
        fields: [
          { name: 'bank', label: 'Bank Name' },
          { name: 'csa', label: 'CSA Status' },
          { name: 'threshold', label: 'Threshold' }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.banksService.addBank(result).subscribe({
          next: (newBank) => {
            this.products.push(newBank);
            this.filteredBanks.push(newBank);
            this.toastr.success('Bank added successfully');
          },
          error: (error) => {
            this.toastr.error('Error adding bank', error.message);
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.spinner.show();
    this.banksService.getBanks().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredBanks = [...data];
        this.spinner.hide();
      },
      error: (error) => {
        this.toastr.error('Failed to load banks');
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

  deleteBank(id: number): void {
    this.banksService.deleteBank(id).subscribe({
      next: (res) => {
        this.products = this.products.filter(product => product.id_bank !== id);
        this.filteredBanks = this.filteredBanks.filter(product => product.id_bank !== id);
        this.toastr.success('Bank successfully deleted.');
      },
      error: (err) => {
        this.toastr.error('Failed to delete bank. ' + err.message);
      }
    });
  }

  toggleEdit(bank: BankInterface, value: boolean): void {
    bank.editing = value;
  }

  saveBank(bank: BankInterface): void {
    this.banksService.updateBank(bank).subscribe({
      next: () => {
        this.toastr.success('Bank updated successfully!');
        bank.editing = false;
      },
      error: (error) => {
        this.toastr.error('Error updating bank');
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredBanks = this.products.filter((bank) => {
      return Object.values(bank).some((value) =>
        value && value.toString().toLowerCase().includes(filterValue)
      );
    });
  }
}
