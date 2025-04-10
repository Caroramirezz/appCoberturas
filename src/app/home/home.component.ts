import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HomeService } from './home.service';
import { Menu } from './menu.interface';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { PlattsService } from '../platts/platts.service';
import { PlattsRecordInsert } from '../platts/platts.interface';
import { IndexService } from '../admin/indexes/services/index.service';
import { IndexInterface } from '../admin/indexes/interfaces/indexes.interface';
import { BloombergService } from '../bloomberg/bloomberg.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [DatePipe]
})
export class HomeComponent implements OnInit {

  nombre_usuario:string = "";
  permiso_usuario:string = "";
  arrayMenu = [{}] as Menu[];
  symbols: IndexInterface[] = [];
  selectedSymbols: string[] = [];
  bateOptions: string[] = 'abcehlmouw'.split(''); // Bates to fetch
  selectedBate: string = 'u';  // Default bate
  loading: boolean = false;
  localStorageKey = 'bloomberg_last_fetch_date';

  constructor(
    private router:Router,
    private homeService: HomeService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private plattsService: PlattsService,  // Platts API Service
    private bloombergService: BloombergService,  // Bloomberg API Service
    private indexService: IndexService,    // Index service for fetching symbols
    ) { 
      this.nombre_usuario = sessionStorage.getItem("nombre_usuario")!.toString();
      this.permiso_usuario = sessionStorage.getItem("permiso_usuario")!.toString();
    }

    ngOnInit(): void {
      this.checkAndFetchData();
      this.mostrarMenus();
      //this.spinner.show();
    
      this.indexService.getIndexes().subscribe(indexes => {
        console.log('Fetched Indexes:', indexes);  // Log all indexes before filtering
  
        // Filter based on 'index_symbol_P'
        this.symbols = indexes.filter(symbol => symbol.index_symbol_P);  // Only include symbols with index_symbol_P populated
        this.selectedSymbols = this.symbols.map(symbol => symbol.index_symbol_P);
  
        console.log('Filtered Symbols:', this.selectedSymbols);  // Log the filtered symbols
  
        // Call the function to sync the Platts data
        if (this.selectedSymbols.length > 0) {
          this.syncPlattsData();  // Only call if symbols are found
        } else {
          console.warn('No symbols found with index_symbol_P. API call will not be made.');
          //this.spinner.hide();
        }
      });
    }
    checkAndFetchData() {
      const today = this.getFormattedTodayDate();

    // Check if today's data has already been fetched by looking at localStorage
    const lastFetchDate = localStorage.getItem(this.localStorageKey);

    if (lastFetchDate !== today) {
      // If not fetched today, make the API call
      this.performDataRequest(today);
    } else {
      //this.performDataRequest(today);
      console.log('Data for today has already been fetched.');
    }
    }

    
    async performDataRequest(today: string) {
      try {
        this.loading = true;
        this.spinner.show();
  
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);        
        const requestIdentifier = 'u7vb4EcLSaMV'; // Example request ID
        
        //const snapshotDate = today;
        //const snapshotDate = '20250310';
        const snapshotDate = `${yesterday.getFullYear()}${(yesterday.getMonth() + 1).toString().padStart(2, '0')}${yesterday.getDate().toString().padStart(2, '0')}`;

        // Call Bloomberg API and store the data
        const response = await this.bloombergService.getDistributionUrl(requestIdentifier, snapshotDate);
  
        if (response && response.length > 0) {
          // Log data before calling the store function
          console.log('Data to be sent to backend:', response);
    
          // Send fetched data to the backend
          await this.bloombergService.storeBloombergData(response).subscribe({
            next: (result) => {
              console.log('Response from backend:', result);
            },
            error: (error) => {
              console.error('Error storing data in the backend:', error);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching and storing data:', error);
      } finally {
        this.spinner.hide();
        this.loading = false;
      }
    }
  
    // Helper method to format today's date in 'yyyyMMdd' format
    getFormattedTodayDate(): string {
      const today = new Date();
      return this.datePipe.transform(today, 'yyyyMMdd') || '';
    }
  
    getFormattedSnapshotDate(date: Date): string {
      const yyyyMMdd = new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date).replace(/\//g, '');
      return yyyyMMdd;
    }

    mostrarMenus() {
      const permissionsJson = localStorage.getItem('userPermissions');
      const permissions = permissionsJson ? JSON.parse(permissionsJson) : {};
      const permiso_usuario = localStorage.getItem('permisoUsuario');
    
      this.arrayMenu = [
        { title: 'Dashboard', icon: 'dashboard', link: '/home/dashboard/usuario' },
        { title: 'Trades', icon: 'receipt_long', link: '/home/trade' },
        {
          title: 'Market Data',
          icon: 'query_stats',
          children: [
            { title: 'Platts', iconPath: 'assets/images/platts_logo.png', link: '/home/platts' },
            { title: 'Bloomberg', iconPath: 'assets/images/bloomberg_logo.png', link: '/home/bloomberg', customClass: 'bloomberg-icon' },
          ]
        }
      ];
    
      if (permissions.catalogs) {
        this.arrayMenu.push({
          title: 'Catalogs',
          icon: 'admin_panel_settings',
          children: [
            { title: 'Clients', icon: 'groups', link: '/home/admin/clients/consulta' },
            { title: 'SARS', icon: 'trending_up', link: '/home/admin/sars/consulta' },
            { title: 'Banks', icon: 'account_balance', link: '/home/admin/banks/consulta' },
            { title: 'Indexes', icon: 'numbers', link: '/home/admin/indexes/consulta' },
            { title: 'Worst Case', icon: '123', link: '/home/admin/worst-case/consulta' }
          ]
        });
      }
    
      if (permiso_usuario === '1') {
        this.arrayMenu.push({
          title: 'User Permissions',
          icon: 'manage_accounts',
          link: '/home/permissions'
        });
      }
    }
    
    
   syncPlattsData() {
   // this.spinner.show();
  
    // First, fetch the latest date from the backend
    this.homeService.fetchMostRecentDate().subscribe(
      (response) => {
        // Log the response to ensure we are receiving the correct assess_date
        console.log('Latest date from backend:', response);
  
        // Use the latest date or default to '2020-01-01' if assess_date is null
        let startDate = response?.assess_date ? moment(response.assess_date).format('YYYY-MM-DD') : '2020-01-01';
        const endDate = moment().format('YYYY-MM-DD');
  
        console.log(`Fetching data from ${startDate} to ${endDate}`);
  
        // Fetch data for multiple bates
        
      },
      (error) => {
        console.error('Error fetching latest date from backend:', error);
        // If there's an error fetching the date, set the start date to the default value '2020-01-01'
        const startDate = '2020-01-01';
        const endDate = moment().format('YYYY-MM-DD');
        
        console.log(`Using default start date: ${startDate} to fetch data`);
  
        // Proceed with fetching Platts data even when there's an error in fetching the latest date
        this.homeService.fetchPlattsData(this.selectedSymbols, this.bateOptions, startDate, endDate)
          .subscribe(apiData => {
            console.log('API Data Fetched:', apiData);
  
            if (apiData && apiData.results.length > 0) {
              const mappedData: PlattsRecordInsert[] = [];
  
              apiData.results.forEach((symbolData: any) => {
                symbolData.data.forEach((dataItem: any) => {
                  mappedData.push({
                    symbol: symbolData.symbol,
                    value: dataItem.value,
                    assess_date: dataItem.assessDate,
                    mod_date: null,
                    bate: dataItem.bate
                  });
                });
              });
  
              // Insert the fetched records into the backend
              this.homeService.insertPlattsData(mappedData).subscribe({
                next: (response) => {
                  console.log('Data successfully inserted:', response);
                  this.spinner.hide();  // Hide spinner after successful insertion
                },
                error: (error) => {
                  console.error('Error inserting data:', error);
                  this.spinner.hide();  // Hide spinner on error
                }
              });
            } else {
              console.warn('No data fetched from the Platts API.');
              this.spinner.hide();
            }
          }, error => {
            console.error('Error fetching data from Platts API:', error);
            this.spinner.hide();
          });
      }
    );
  }
  
  cerrarSesion(){
    //localStorage.clear();
    localStorage.removeItem('authToken');
    localStorage.removeItem('permisoUsuario');
    sessionStorage.clear();
    this.router.navigateByUrl("/auth/login");
    
  }
}
