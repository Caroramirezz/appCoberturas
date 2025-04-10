import { Component, OnInit, ViewChild } from '@angular/core';
import { BloombergService } from './bloomberg.service';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { IndexService } from 'src/app/admin/indexes/services/index.service';
import { TradesService } from 'src/app/trades/services/trades.service';
import { IndexInterface } from '../admin/indexes/interfaces/indexes.interface';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-root',
  templateUrl: './bloomberg.component.html',
  styleUrls: ['./bloomberg.component.scss'],
  providers: [DatePipe]
})
export class BloombergComponent implements OnInit {
  selectedTab: string = 'table';
  content: any;
  tableData: any[] = [];
  //displayedColumns: string[] = [];
  allColumns: string[] = []; // To store all column names
  selectedColumns: string[] = []; // To store selected column names
  //filteredSymbols: Observable<any[]>; // For filtered symbols
  filteredData: any[] = []; // Filtered data
  requestIdentifierCtrl = new FormControl('u7vb4EcLSaMV'); // Request ID control
  snapshotDateCtrl = new FormControl(new Date('2024-08-15')); // Snapshot date control
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  bate: string = '';
  selectedSymbols: string[] = [];
  loading: boolean = false; // Add this property
  storedRecords: any[] = []; // All fetched records
  filteredStoredRecords: any[] = []; // Records after filtering
  displayedColumns: string[] = ['id', 'snapshot','identifier', 'pxLast', 'lastTradeableDt'];
  columns: string[] = [];
  sortAscending: boolean = true; // Sort direction for the date column
 
  matrixData: any = {};
  uniqueSnapshots: string[] = [];
  uniqueIdentifiers: string[] = [];
  lastTradeableDates: { [key: string]: string } = {};
  identifierMapping: { [key: string]: string } = {};
  
  startDateCtrl = new FormControl();
  endDateCtrl = new FormControl();
  identifierCtrl = new FormControl();
  sortByCtrl = new FormControl();

  symbols: IndexInterface[] = [];
  symbolSearchCtrl = new FormControl('');
  filteredSymbols!: Observable<IndexInterface[]>;
  searchValue: string | undefined;
  symbolToName: { [key: string]: string } = {};
  

  constructor(
    private bloombergService: BloombergService,
    private datePipe: DatePipe,
    private indexService: IndexService,
    private wsTrade:TradesService,
    private spinner: NgxSpinnerService // Inject the spinner service
  ) {
    this.filteredSymbols = of(this.symbols);
  }


  ngOnInit() {
    this.loading = true;

    // Fetch symbols from backend
    this.indexService.getIndexes().subscribe(data => {
        // Store all indexes
        this.symbols = data.filter(symbol => symbol.index_symbol_B);

        // Create a mapping: index_symbol_B → index_name
        this.symbolToName = {};
        this.symbols.forEach(symbol => {
            if (symbol.index_symbol_B) {
                this.symbolToName[symbol.index_symbol_B] = symbol.index_name;
            }
        });

        // Extract valid identifiers
        this.selectedSymbols = this.symbols.map(symbol => symbol.index_symbol_B);

        // Setup filtering for symbols in the UI
        this.filteredSymbols = this.symbolSearchCtrl.valueChanges.pipe(
            startWith(''),
            map(value => this._filterSymbols(value))
        );

        // Fetch Bloomberg data after loading index symbols
        this.fetchStoredRecords();
    });
}


  /*async performDataRequest() {
    try {
      this.loading = true; // Set loading to true
      this.spinner.show(); // Show spinner
      const requestIdentifier = this.requestIdentifierCtrl.value;
      const snapshotDate = this.getFormattedSnapshotDate();

      // Get distribution content
      this.content = await this.bloombergService.getDistributionUrl(requestIdentifier, snapshotDate);
      console.log('File content:', this.content);

      // Process data for the table
      if (this.content && this.content.length > 0) {
        this.tableData = this.content;
        this.allColumns = Object.keys(this.tableData[0]); // Get columns from the first row
        this.selectedColumns = [...this.allColumns]; // Display all columns initially
        this.filteredData = [...this.tableData]; // Show all data initially
      }
    } catch (error) {
      console.error('Error in data request process:', error);
    } finally {
      this.spinner.hide(); // Hide spinner
      this.loading = false; // Set loading to false
    }
  }*/

  fetchStoredRecords() {
    this.loading = true;
    this.spinner.show();
    this.bloombergService.getStoredBloombergRecords().subscribe(
      (records: any[]) => {
        this.storedRecords = records;
        this.filteredStoredRecords = [...records]; // Display all records initially
        this.prepareMatrixData(records); 
        this.loading = false;
        this.spinner.hide();
      },
      (error) => {
        console.error('Error fetching stored records:', error);
        this.loading = false;
      }
    );
  }

  prepareMatrixData(records: any[]) {
    this.matrixData = {};
    this.lastTradeableDates = {};
    this.identifierMapping = {};

    // Only keep identifiers that exist in index_symbol_B
    const allowedIdentifiers = new Set(this.selectedSymbols);

    // Extract unique trade dates (dlSnapshotStartTime) (Y-Axis) and sort descending
    this.uniqueSnapshots = [...new Set(records.map(r => r.dlSnapshotStartTime))]
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Sort by most recent first

    // Extract identifiers but keep only allowed ones (X-Axis)
    this.uniqueIdentifiers = this.selectedSymbols.filter(identifier => allowedIdentifiers.has(identifier));

    // Ensure matrixData is initialized with dlSnapshotStartTime rows
    this.uniqueSnapshots.forEach(snapshot => {
        this.matrixData[snapshot] = {}; // Initialize each row
        this.uniqueIdentifiers.forEach(baseIdentifier => {
            this.matrixData[snapshot][baseIdentifier] = '-'; // Default empty value
        });
    });

    // Find the most relevant identifier per snapshot date
    records.forEach(record => {
        const baseIdentifier = record.identifier.replace(/\d+$/, ''); // Remove number suffix

        // Only process identifiers in `index_symbol_B`
        if (allowedIdentifiers.has(baseIdentifier)) {
            if (
                !this.identifierMapping[baseIdentifier] ||
                new Date(record.dlSnapshotStartTime) > new Date(this.identifierMapping[baseIdentifier])
            ) {
                this.identifierMapping[baseIdentifier] = record.identifier;
            }
        }
    });

    // Populate the matrix with px_last values, ensuring trade dates are used
    records.forEach(record => {
        const baseIdentifier = record.identifier.replace(/\d+$/, '');

        if (this.identifierMapping[baseIdentifier] === record.identifier) {
            this.matrixData[record.dlSnapshotStartTime][baseIdentifier] = record.pxLast || '-';
        }
    });

    // Store the last tradable date for each identifier
    this.uniqueIdentifiers.forEach(baseIdentifier => {
        const latestTrade = records
            .filter(r => r.identifier === this.identifierMapping[baseIdentifier])
            .sort((a, b) => new Date(b.lastTradeableDt).getTime() - new Date(a.lastTradeableDt).getTime())[0];

        if (latestTrade) {
            this.lastTradeableDates[baseIdentifier] = latestTrade.lastTradeableDt;
        }
    });

    // Debugging - Check output
    console.log("Sorted Unique Snapshots (Most Recent to Oldest):", this.uniqueSnapshots);
    console.log("Matrix Data:", this.matrixData);
    console.log("Last Tradable Dates:", this.lastTradeableDates);
}

isToday(snapshot: string): boolean {
  if (!snapshot) return false;

  const today = new Date();
  const snapshotDate = new Date(snapshot);

  return (
      snapshotDate.getFullYear() === today.getFullYear() &&
      snapshotDate.getMonth() === today.getMonth() &&
      snapshotDate.getDate() === today.getDate()
  );
}


switchTab(tab: string) {
  this.selectedTab = tab;
}
  
  exportToCSV() {
  // Fetch the bloomberg_records data from backend
  this.wsTrade.getBloombergRecords().subscribe(data => {
    const csvData = this.convertToCSV(data);  // Convert the fetched data to CSV format
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'bloomberg_records.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, error => {
    console.error("Error fetching data:", error);
  });
}

convertToCSV(data: any[]): string {
  if (!data || !data.length) {
    return '';
  }
  
  const separator = ',';
  const keys = Object.keys(data[0]);  // Dynamically get column headers
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

sortByDate(): void {
  console.log('Before Sorting:', this.filteredStoredRecords);

  this.filteredStoredRecords = [...this.filteredStoredRecords.sort((a, b) => {
    const dateA = Date.parse(a.dlSnapshotStartTime) || 0;
    const dateB = Date.parse(b.dlSnapshotStartTime) || 0;
    return this.sortAscending ? dateA - dateB : dateB - dateA;
  })];

  this.sortAscending = !this.sortAscending; // Toggle sort direction
  this.filteredStoredRecords = this.filteredStoredRecords.slice(); // Trigger UI change

  console.log('After Sorting:', this.filteredStoredRecords);
}

clear(table: Table) {
  table.clear();

}

  getFormattedSnapshotDate(): string {
    const date = this.snapshotDateCtrl.value;
    const formattedDate = this.datePipe.transform(date, 'yyyyMMdd');
    return formattedDate ? formattedDate : '';
  }

  private _filterSymbols(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.symbols.filter(symbol => symbol.index_name.toLowerCase().includes(filterValue));
  }

  openAddDialog() {
    // Logic to open the add index dialog
  }

  onSelectOpen(opened: boolean) {
    if (opened) {
      setTimeout(() => {
        document.querySelector<HTMLInputElement>('.search-container input')?.focus();
      });
    }
  }

  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredStoredRecords = this.filteredStoredRecords.filter(record =>
        Object.values(record).some(value =>
            value && String(value).toLowerCase().includes(filterValue)
        )
    );
}

  applyDateFilter() {
    const startDate = this.startDateCtrl.value
      ? new Date(this.startDateCtrl.value)
      : null;
    const endDate = this.endDateCtrl.value
      ? new Date(this.endDateCtrl.value)
      : null;

    this.filteredStoredRecords = this.storedRecords.filter((record) => {
      const recordDate = new Date(record.lastTradeableDt);
      return (
        (!startDate || recordDate >= startDate) &&
        (!endDate || recordDate <= endDate)
      );
    });
  }


  onDateChange(event: any) {
    const date = event.value;
    this.snapshotDateCtrl.setValue(date);
    console.log('Selected date:', date);
  }

  /*onNewRequest() {
    this.performDataRequest();
  }*/

  sortRecords() {
    const sortBy = this.sortByCtrl.value;

    this.filteredStoredRecords.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.lastTradeableDt).getTime() - new Date(b.lastTradeableDt).getTime();
      } else if (sortBy === 'identifier') {
        return a.identifier.localeCompare(b.identifier);
      }
      return 0;
    });
  }

  resetFilters() {
    this.startDateCtrl.reset();
    this.endDateCtrl.reset();
    this.sortByCtrl.reset();
    this.filteredStoredRecords = [...this.storedRecords];
  }

  onColumnChange() {
    this.filteredData = this.tableData.map(row => {
      const filteredRow: any = {};
      this.selectedColumns.forEach(col => {
        filteredRow[col] = row[col];
      });
      return filteredRow;
    });
  }
  
}
