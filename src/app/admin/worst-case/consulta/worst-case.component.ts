import { Component, OnInit } from '@angular/core';
import { WorstCaseService } from '../services/worst-case.service';
import { WorstCaseInterface } from '../interfaces/worst-case.interface';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { AddDialogComponent } from '../../add-dialog/add-dialog.component';
import { IndexService } from '../../indexes/services/index.service';



@Component({
  selector: 'app-worst-case',
  templateUrl: './worst-case.component.html',
  styleUrls: ['./worst-case.component.scss'],
})
export class WorstCaseComponent implements OnInit {
  products: WorstCaseInterface[] = [];
  transformedData: any[] = [];
  columns: string[] = [];
  filteredData: any[] = [];
  editedRows: Set<string> = new Set(); // Track edited rows
  isEdited: boolean = false;
  loading: boolean = false;
  sortAscending: boolean = true; // Sort direction for the date column
  indexOptions: any[] = [];
  

  constructor(
    private worstCaseService: WorstCaseService,
    private indexService: IndexService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.loadData();
    this.loadIndexes();
  }

  loadIndexes(): void {
    this.indexService.getIndexes().subscribe({
      next: (indexes) => {
        // Populate dropdown options
        this.indexOptions = indexes.map((index) => ({
          label: index.index_name,
          value: index.index_name,
        }));
  
        // Ensure all indexes are included as table columns
        const allIndexes = indexes.map((index) => index.index_name);
        this.columns = ['Date', ...allIndexes]; // Start with "Date" as the first column
      },
      error: () => {
        this.toastr.error('Failed to load indexes');
      },
    });
  }

  // Load data and transform into matrix format
  loadData(): void {
    this.worstCaseService.getWC().subscribe({
      next: (data) => {
        this.products = data;
  
        // Add missing indexes from the Worst Case data to the columns
        const uniqueIndexes = Array.from(new Set(data.map((item) => item.index_name)));
        this.columns = Array.from(new Set(['Date', ...this.columns.slice(1), ...uniqueIndexes]));
  
        // Transform data into a matrix for the table
        this.transformedData = this.transformToMatrix(data);
        this.filteredData = [...this.transformedData];
        this.spinner.hide();
      },
      error: () => {
        this.toastr.error('Failed to load Worst Cases');
        this.spinner.hide();
      },
    });
  }

  // Transform raw data into a matrix (rows: dates, columns: indexes)
  transformToMatrix(data: WorstCaseInterface[]): any[] {
    const grouped: { [key: string]: any } = {};
  
    data.forEach((item) => {
      const dateKey = moment(item.period_case).format('MM/DD/YYYY');
      if (!grouped[dateKey]) grouped[dateKey] = { Date: dateKey };
      grouped[dateKey][item.index_name] = item.wc_price || '-';
    });
  
    console.log('Transformed Data:', Object.values(grouped));
    return Object.values(grouped); // Return matrix format
  }
  

  // Search by date
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredData = this.transformedData.filter((row) =>
      row.Date.toLowerCase().includes(filterValue)
    );
  }

  // Sort by date column
  sortByDate(): void {
    this.filteredData.sort((a, b) => {
      const dateA = new Date(a.Date).getTime();
      const dateB = new Date(b.Date).getTime();
      return this.sortAscending ? dateA - dateB : dateB - dateA;
    });
    this.sortAscending = !this.sortAscending; // Toggle sort direction
  }

  // Enable editing for a cell
  toggleEdit(row: any, col: string): void {
    const key = `${row.Date}-${col}`;
    if (this.editedRows.has(key)) {
      this.editedRows.delete(key);
    } else {
      this.editedRows.add(key);
    }
    this.isEdited = this.editedRows.size > 0;
  }

  openAddDialog(): void {
  const dialogRef = this.dialog.open(AddDialogComponent, {
    width: '400px',
    data: {
      title: 'Add Worst Case',
      fields: [
        {
          name: 'index_name',
          label: 'Index Name',
          type: 'dropdown',
          options: this.indexOptions, // Populate from the backend
        },
        { name: 'period_case', label: 'Date', type: 'date' },
        { name: 'wc_price', label: 'Price', type: 'number' },
      ],
    },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.spinner.show();
      this.worstCaseService.addWC(result).subscribe({
        next: (newWC) => {
          this.products.push(newWC);
          this.transformedData = this.transformToMatrix(this.products);
          this.filteredData = [...this.transformedData];
          this.toastr.success('Worst Case added successfully');
        },
        error: () => {
          this.toastr.error('Error adding Worst Case');
        },
        complete: () => this.spinner.hide(),
      });
    }
  });
}


onEditChange(row: any, col: string, value: any): void {
  const key = `${row.Date}-${col}`;
  const oldValue = row[col];

  if (oldValue !== value) {
    this.editedRows.add(key); // Track the change
    row[col] = value; // Update the value in the row
  }

  // Don't deactivate the input field; only update the Save button state
  this.updateEditState();
}



  // Detect changes and enable save button
  updateEditState(): void {
    this.isEdited = this.editedRows.size > 0 || this.transformedData.length !== this.products.length;
  }

  saveEdits(): void {
    setTimeout(() => {
      if (!this.isEdited || this.editedRows.size === 0) {
        this.toastr.error('No changes to save');
        return;
      }
  
      const changes = Array.from(this.editedRows).map((key) => {
        const [date, index] = key.split('-');
        const row = this.transformedData.find((r) => r.Date === date);
        return {
          index_name: index,
          period_case: moment(date, 'MM/DD/YYYY').toISOString(), // Convert to ISO
          wc_price: row[index], // Get the edited value
        };
      });
  
      this.spinner.show();
      this.worstCaseService.InsertWC(changes).subscribe({
        next: () => {
          this.toastr.success('Changes saved successfully!');
          this.editedRows.clear(); // Clear edited rows
          this.loadData(); // Reload data
          this.isEdited = false; // Disable Save button
        },
        error: (err) => {
          this.toastr.error(`Failed to save changes: ${err.error}`);
          this.spinner.hide();
        },
        complete: () => this.spinner.hide(),
      });
    }, 50); // Add a small delay to allow state updates
  }  
  
  
}
