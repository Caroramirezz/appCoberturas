import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PlattsService } from './platts.service';
import moment from 'moment';
import { DataItem } from './platts.interface';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IndexService } from 'src/app/admin/indexes/services/index.service';
import { IndexInterface } from 'src/app/admin/indexes/interfaces/indexes.interface'; 
import { AddDialogComponent } from 'src/app/admin/add-dialog/add-dialog.component'; 

@Component({
  selector: 'app-platts',
  templateUrl: './platts.component.html',
  styleUrls: ['./platts.component.scss']
})
export class PlattsComponent implements OnInit {

  @ViewChild('searchInput') searchInput!: ElementRef;

  response: any;
  responseHistory: DataItem[] = [];
  tableData: DataItem[] = [];
  filteredData: DataItem[] = [];
  
  fechaInicio: Date = moment().startOf('month').toDate();
  fechaFin: Date = moment().endOf('month').toDate();
  bate: string = '';
  selectedSymbols: string[] = [];

  symbols: IndexInterface[] = []; // Usar la interfaz IndexInterface para los símbolos
  symbolSearchCtrl = new FormControl('');
  filteredSymbols!: Observable<IndexInterface[]>;

  constructor(private WsPlatts: PlattsService, private indexService: IndexService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.indexService.getIndexes().subscribe(data => {
      this.symbols = data;
      this.filteredSymbols = this.symbolSearchCtrl.valueChanges.pipe(
        startWith(''),
        map(value => this._filterSymbols(value))
      );
    });
  }

  private _filterSymbols(value: string): IndexInterface[] {
    const filterValue = value.toLowerCase();
    return this.symbols.filter(symbol => symbol.index_name.toLowerCase().includes(filterValue));
  }

  onSelectOpen(isOpen: boolean): void {
    if (isOpen) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      });
    }
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      width: '250px',
      data: {
        title: 'Index',
        fields: [
          { name: 'index_name', label: 'Index' },
          { name: 'index_symbol', label: 'Ticker' },
          { name: 'source', label: 'Source' }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.indexService.addIndex(result).subscribe({
          next: (newIndex) => {
            this.symbols.push(newIndex);
            this.filteredSymbols = this.symbolSearchCtrl.valueChanges.pipe(
              startWith(this.symbolSearchCtrl.value),
              map(value => this._filterSymbols(value))
            );
          },
          error: (error) => {
            console.error('Error adding index', error);
          }
        });
      }
    });
  }

  filterData() {
    if (!this.selectedSymbols.length) {
      alert('At least one symbol is mandatory in filter.');
      return;
    }

    const startDate = moment(this.fechaInicio).format('YYYY-MM-DD');
    const endDate = moment(this.fechaFin).format('YYYY-MM-DD');
    
    this.WsPlatts.historyData(this.selectedSymbols, this.bate, startDate, endDate).subscribe(result => {
      this.responseHistory = result;
      this.tableData = result.map((item, index) => ({
        ...item,
        num: index + 1,
        index: this.symbols.find(symbol => symbol.index_symbol === item.symbol)?.index_name || ''
      })); // Asigna el número y el índice a cada fila
      this.filteredData = this.tableData;
    },
    error => {
      console.log(error);
    });
  }

  request() {
    this.WsPlatts.getToken().subscribe(result => {
      this.response = result;
      sessionStorage.setItem("access_token", this.response.access_token);
      sessionStorage.setItem("refresh_token", this.response.refresh_token);
    },
    error => {
      console.log(error);
    });
  }

  getHistory() {
    if (!this.selectedSymbols.length) {
      alert('At least one symbol is mandatory in filter.');
      return;
    }

    const startDate = moment(this.fechaInicio).format('YYYY-MM-DD');
    const endDate = moment(this.fechaFin).format('YYYY-MM-DD');
    
    this.WsPlatts.historyData(this.selectedSymbols, this.bate, startDate, endDate).subscribe(result => {
      this.responseHistory = result;
      this.tableData = result.map((item, index) => ({
        ...item,
        num: index + 1,
        index: this.symbols.find(symbol => symbol.index_symbol === item.symbol)?.index_name || ''
      })); // Asigna el número y el índice a cada fila
      this.filteredData = this.tableData;
    },
    error => {
      console.log(error);
    });
  }

  applyFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim().toLowerCase();
    this.filteredData = this.tableData.filter(item => 
      item.symbol.toLowerCase().includes(value) ||
      item.bate.toLowerCase().includes(value) ||
      item.value.toString().toLowerCase().includes(value) ||
      item.assessDate.toLowerCase().includes(value) ||
      item.index.toLowerCase().includes(value)
    ).map((item, index) => ({ ...item, num: index + 1 })); // Reasigna el número después de filtrar
  }

  clearFilters() {
    this.filteredData = [...this.tableData];
  }
}
