import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PlattsService } from './platts.service';
import moment from 'moment';
import { DataItem, PlattsHistory } from './platts.interface';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IndexService } from 'src/app/admin/indexes/services/index.service';
import { IndexInterface } from 'src/app/admin/indexes/interfaces/indexes.interface'; 
import { AddDialogComponent } from 'src/app/admin/add-dialog/add-dialog.component';
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-platts',
  templateUrl: './platts.component.html',
  styleUrls: ['./platts.component.scss']
})
export class PlattsComponent implements OnInit {

  @ViewChild('searchInput') searchInput!: ElementRef;

  response: any;
  responseHistory: DataItem[] = [];
  tableData: any[] = [];
  filteredData: any[] = [];
  fullTableData: any[] = [];
  products: IndexInterface[] = [];  
  filteredIndex: IndexInterface[] = [];

  loading: boolean = false; // Loading flag for spinner
  noData: boolean = false;  // Flag to indicate no data returned
  
  // Default start date: Jan 1, 2020 and end date: today
  fechaInicio: Date = moment('2020-01-01').toDate(); 
  fechaFin: Date = moment().toDate(); // Current date

  bate: string = 'u'; // Default value for Bate
  selectedSymbols: string[] = [];

  symbols: IndexInterface[] = [];
  symbolSearchCtrl = new FormControl('');
  filteredSymbols!: Observable<IndexInterface[]>;
  columns: string[] = [];

  bateOptions: string[] = 'hluw'.split(''); // Array of letters a-z

  isEdited: boolean = false;
  editedRows: any[] = [];

  constructor(
    private WsPlatts: PlattsService, 
    private indexService: IndexService, 
    public dialog: MatDialog,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService  // Inject the spinner service
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.loading = true;
  
    // Fetch symbols on init
    this.indexService.getIndexes().subscribe(data => {
      // Include both index_symbol_P and index_symbol_Neg
      this.symbols = data.filter(symbol => symbol.index_symbol_P || symbol.index_symbol_Neg);
  
      // Combine both P and Neg symbols for the selected symbols
      this.selectedSymbols = this.symbols
  .map(symbol => [symbol.index_symbol_P, symbol.index_symbol_Neg].filter(Boolean))
  .reduce((acc, val) => acc.concat(val), []);
  
      // Add 'Date' and include both P and Neg symbols in the columns
      this.columns = ['Date', ...this.symbols.map(symbol => symbol.index_name)];
  
      this.filteredSymbols = this.symbolSearchCtrl.valueChanges.pipe(
        startWith(''),
        map(value => this._filterSymbols(value))
      );
  
      // Load the backend data and apply bate filter
      this.loadBackendRecords();
    });
  }
  exportToCSV() {
    const csvData = this.convertToCSV(this.filteredData);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'filtered-data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  convertToCSV(data: any[]): string {
    if (!data || !data.length) {
      return '';
    }
    
    const separator = ',';
    const keys = Object.keys(data[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      data.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell.toString().replace(/"/g, '""'); // Escape double quotes
          return `"${cell}"`; // Wrap in double quotes
        }).join(separator);
      }).join('\n');
    
    return csvContent;
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
  isNegColumn(columnName: string): boolean {
    return this.symbols.some(symbol => symbol.index_name === columnName && symbol.index_symbol_Neg);
  }
  onEditChange(row: any, col: string, value: any): void {
    this.isEdited = true;

    // Track the edited row (date, index, bate, and value)
    const editedRow = {
      date: row.Date,
      index: col,         // Column represents the index name
      value: value,       // The modified value entered by the user
      bate: this.bate     // The current bate filter applied in the table
    };
    const existingIndex = this.editedRows.findIndex(
      r => r.date === editedRow.date && r.index === editedRow.index && r.bate === editedRow.bate
    );
  
    if (existingIndex > -1) {
      // Replace the existing entry with the updated values
      this.editedRows[existingIndex] = editedRow;
    } else {
      // Add the new edit if it doesn't exist yet
      this.editedRows.push(editedRow);
    }
    console.log('Edited Row:', editedRow);
    // Add the edited row to the changes array (you can also check for duplicates)
    this.editedRows.push(editedRow);
  }

  saveEdits(): void {
    if (!this.isEdited || this.editedRows.length === 0) return;
  
    // Clean up the payload: Convert empty values to a default number (e.g., 0) and ensure correct date formatting
    const cleanedRecords = this.editedRows.map(row => ({
      symbol: this.getNegSymbolForIndex(row.index) || "",  // Use a fallback if symbol is null
      assess_date: moment(row.date, 'MM/DD/YY').format('YYYY-MM-DD'),  // Convert date to ISO format (YYYY-MM-DD)
      value: row.value.trim() === '' ? 0 : parseFloat(row.value),  // Ensure value is a number, convert empty strings to 0
      bate: row.bate,
      mod_date: new Date().toISOString()  // Add 'mod_date' with the current date in ISO format
    }));
    console.log('Cleaned Records:', cleanedRecords);
  
    // Pass the array directly to the service
    this.WsPlatts.insertPlattsRecords(cleanedRecords).subscribe({
      next: (response) => {
        this.toastr.success('Records saved successfully!');
        this.isEdited = false;  // Reset the flag
        this.editedRows = [];   // Clear the edited rows after saving
      },
      error: (err) => {
        this.toastr.error(`Failed to save records: ${err.message}`);
      }
    });
  }
  
  // Helper function to get index_symbol_Neg for a given index (symbol name)
  getNegSymbolForIndex(indexName: string): string | null {
    const symbolData = this.symbols.find(sym => sym.index_name === indexName);
    return symbolData ? symbolData.index_symbol_Neg : null;
  }
  
  
  

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

generateTableData(data: any[]) {
  const table: { [key: string]: any } = {};

  // Loop through each data entry
  data.forEach(item => {
    const date = moment(item.assess_date).format('MM/DD/YY');

    // Find the corresponding symbol (either P or Neg)
    const symbol = this.symbols.find(sym => sym.index_symbol_P === item.symbol || sym.index_symbol_Neg === item.symbol)?.index_name;
    const bate = item.bate;

    if (!symbol) return;  // Skip if the symbol doesn't match any known symbol

    // Initialize the table row by date if not already created
    if (!table[date]) {
      table[date] = { Date: date };  // Create a row for each date
    }

    // Store the value for the current bate and symbol
    if (!table[date][symbol]) {
      table[date][symbol] = {};  // Initialize object to store bates per symbol
    }
    table[date][symbol][bate] = item.value || '-';  // Store value for each symbol and bate
  });

  // Convert the object to an array for display
  this.fullTableData = Object.values(table).sort((a: any, b: any) =>
    moment(b.Date, 'MM/DD/YY').diff(moment(a.Date, 'MM/DD/YY'))
  );

  // Call filterByBate to filter the table by the selected bate
  this.filterByBate();  // Filter data after table generation
}

  // Original filter method
  applyFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim().toLowerCase();
    
    this.filteredData = this.tableData.filter(item => 
      Object.values(item).some((val: any) => val.toString().toLowerCase().includes(value))
    );
  }

  clearFilters() {
    this.filteredData = [...this.tableData];
  }

  filterByBate() {
    if (!this.fullTableData) return;
  
    this.filteredData = this.fullTableData.map(row => {
      const filteredRow: any = { Date: row.Date };  // Start with the date
  
      this.symbols.forEach(symbol => {
        if (row[symbol.index_name] && row[symbol.index_name][this.bate]) {
          // Assign the value corresponding to the selected bate
          filteredRow[symbol.index_name] = row[symbol.index_name][this.bate];
        } else {
          filteredRow[symbol.index_name] = '-';  // Default to '-' if no value found
        }
      });
  
      return filteredRow;
    });
  
    // Trigger table update
    console.log(this.filteredData);
  }

  // Add the refresh button functionality
  refreshData() {
    this.loading = true;
    this.spinner.show();  // Show spinner while fetching data

    const startDate = moment(this.fechaInicio).format('YYYY-MM-DD');
    const endDate = moment(this.fechaFin).format('YYYY-MM-DD');
    const batesToFetch = ['u'];  // Fetch data only for bate 'u'

    // Call the PlattsService to fetch the data
    this.WsPlatts.historyData(this.selectedSymbols, batesToFetch, startDate, endDate)
      .subscribe(apiData => {
        console.log('API Data Fetched:', apiData);

        if (apiData && apiData.length > 0) {
          const mappedData = apiData.map(item => ({
            symbol: item.symbol,
            value: item.value,
            assess_date: item.assessDate,
            mod_date: null,
            bate: item.bate
          }));

          // Insert the data into the backend and reload the table
          this.WsPlatts.insertPlattsRecords(mappedData).subscribe({
            next: () => {
              this.loadBackendRecords();  // Load the records again after refreshing
            },
            error: (error) => {
              console.error('Error inserting records:', error);
              this.spinner.hide();
              this.loading = false;
            }
          });
        } else {
          console.warn('No data returned from API.');
          this.spinner.hide();
          this.loading = false;
        }
      }, error => {
        console.error('Error fetching data from API:', error);
        this.spinner.hide();
        this.loading = false;
      });
  }

  // Method to load backend records and display them in the table
  loadBackendRecords() {
  this.WsPlatts.getPlattsRecords().subscribe({
    next: (backendData) => {
      this.generateTableData(backendData);  // Generate the table data
      this.noData = false;
    },
    error: (error) => {
      console.error('Error loading backend records:', error);
      this.noData = true;
    },
    complete: () => {
      this.spinner.hide();
      this.loading = false;
    }
  });
}

  
}