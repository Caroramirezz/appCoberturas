import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PlattsService } from './platts.service';
import moment from 'moment';
import { DataItem } from './platts.interface';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface SymbolOption {
  index: string;
  ticker: string;
}

@Component({
  selector: 'app-platts',
  templateUrl: './platts.component.html',
  styleUrls: ['./platts.component.scss']
})
export class PlattsComponent implements OnInit {

  response: any;
  responseHistory: DataItem[] = [];
  tableData: DataItem[] = [];
  filteredData: DataItem[] = [];
  
  fechaInicio: Date = moment().startOf('month').toDate();
  fechaFin: Date = moment().endOf('month').toDate();
  bate: string = '';
  selectedSymbols: string[] = [];

  symbols: SymbolOption[] = [
    { index: 'Houston ShipChl Mo', ticker: 'IGBAP03' },
    { index: 'Tenn Zn0 Mo', ticker: 'IGBBA03' },
    { index: 'TX Eastern E TX Mo', ticker: 'IGBAN03' },
    { index: 'TX Eastern S TX Mo', ticker: 'IGBBB03' },
    { index: 'Henry Hub Mo', ticker: 'IGBBL03' },
    { index: 'Waha Mo', ticker: 'IGBAD03' },
    { index: 'Oneok OK Mo', ticker: 'IGBCD03' },
    { index: 'Enable Gas Transmission Mo', ticker: 'IGBCA03' },
    { index: 'Transco Zone 5 South Mo', ticker: 'IGCHL03' },
    { index: 'TC Alb AECO-C Mo', ticker: 'IGBCU03' },
    { index: 'Katy Mo', ticker: 'IGBAQ03' },
  ];

  symbolSearchCtrl = new FormControl('');
  filteredSymbols!: Observable<SymbolOption[]>;

  constructor(private WsPlatts: PlattsService) { }

  ngOnInit(): void {
    this.filteredSymbols = this.symbolSearchCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterSymbols(value))
    );
  }

  private _filterSymbols(value: string): SymbolOption[] {
    const filterValue = value.toLowerCase();
    return this.symbols.filter(symbol => symbol.index.toLowerCase().includes(filterValue));
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
        index: this.symbols.find(symbol => symbol.ticker === item.symbol)?.index || ''
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
        index: this.symbols.find(symbol => symbol.ticker === item.symbol)?.index || ''
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
