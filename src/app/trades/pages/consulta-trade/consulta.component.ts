import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TradesService } from '../../services/trades.service';
import moment from 'moment';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ConsultaTrade } from '../../interfaces/consulta-trade.interface';
import { PlattsService } from 'src/app/platts/platts.service';
import { BloombergRecord } from '../../interfaces/trade.interface';
import { Usuario } from 'src/app/auth/interfaces/usuario.interface';
import { AuthService } from 'src/app/auth/auth.service';
import * as Papa from 'papaparse';
import { UserPermissions } from 'src/app/users/user-permission.model';


@Component({
  selector: 'app-solicitudes',
  templateUrl: './consulta.component.html',
  styleUrls: ['./consulta.component.scss']
})

export class ConsultaTradeComponent implements OnInit {

  tradeTypeMapping: Record<string, number> = { "Thirds": 1, "NEG": 2 };
  sarMapping: Record<string, number> = { 290: 1, 314: 11, 342: 30, 272: 6, 273: 7, 288: 3, 292: 2, 293: 5, 300: 4, "NA": 31};
  instrumentMapping: Record<string, number> = { "Swap": 1, "Call": 2, "Put": 3 };
  operationMapping: Record<string, number> = { "Buy": 1, "Sell": 2 };
  hedgeTypeMapping: Record<string, number> = { "Fixed Price": 1, "Basis": 2, "Contract type Spread": 3 };
  currencyMapping: Record<string, number> = { "USD": 1, "GBP": 2 };
  unitMapping: Record<string, number> = { " MMBtu ": 1, " Thm ": 2 };
  volumeBasisMapping: Record<string, number> = {'GDD': 1, 'FERC': 2};
  bankMapping: Record<string, number> = { 'Scotiabank': 2, 'BofA': 3, 'Goldman': 4, 'Cargill': 5, 'JP Morgan': 6,
    'ING': 7, 'Rabobank': 8, 'BNP': 26, 'Citi': 36, 'Fevisa': 38 };
    indexMapping: Record<string, number> = {
      "HSC": 1, "Waha": 2, "Enable Gas East": 3, "Oneok iFERC": 4,
      "HH iFERC": 5,"HH":5, "NBP Heren DA": 10, "Tenn Zn0 Mo": 22, "TX Eastern E TX Mo": 23,
      "TX Eastern S TX Mo": 24, "Transco Zone 5 South Mo": 29, "TC Alb AECO-C Mo": 30,
      "Katy Mo": 31, "NEG": 53, "prueba": 54, "pruebas": 55, "GBPUSD Curncy": 56,
      "Waha-HSC": 57, "HSC Basis": 58, "Waha Basis": 59
    };
  plantsMapping: Record<string, number> = {
    "Sigma Alimentos Centro": 42, "Sigma Alimentos Noreste": 43,
    "Alimentos Finos de Occidente": 44, "Polioles": 45, "Igasamex": 46,
    "Ball Monterrey": 47, "Ball Queretaro": 48, "Ball San Luis Potosí": 49,
    "Tejas el Águila": 50, "Mondelez": 51, "Ricolino": 52, "Ceramistas": 53,
    "Enestas": 54, "Lonza": 55, "Alpek UK": 56, "CGA": 57, "Fevisa": 76, "Ball": 47,
    "Sigma": 81, "Alpek": 82, "Contour": 83, "NEG": 84, "Nemak": 85,
  };
  permissions: UserPermissions = {
    newTrade: false,
    uploadFile: false,
    settled: false,
    editTrade: false,
    actionColumn: false,
    catalogs: false
  };
  

  //Filters
  fechaInicio = moment().startOf('month').toDate();
  fechaFin = moment().endOf('month').toDate();

  products:ConsultaTrade[] = [];  

  cols: any[] = [];  
  filteredData: any[] = [];

  _selectedColumns: any[] = [];
  _selectedColumnsFilter:any[] = [];
  selectedFile: File | null = null;

  selectedProducts3:ConsultaTrade[] = [];

  views: { name: string; columns: any[] }[] = [];
  activeView: { name: string; columns: any[] } | null = null;

  creatingView = false;
  newViewName = '';
  newViewColumns: any[] = [];

  

  constructor(
      private wsTrade:TradesService,
      private authService: AuthService,
      private router:Router,          
      private spinner: NgxSpinnerService,    
      private toastr: ToastrService,  
    ){
      
    }

    

    ngOnInit(): void {
      const savedFechaInicio = localStorage.getItem('lastFechaInicio');
  const savedFechaFin = localStorage.getItem('lastFechaFin');

  this.loadPermissions(); // Si necesitas cargar permisos primero, lo dejas aquí

  if (savedFechaInicio && savedFechaFin) {
    this.fechaInicio = new Date(savedFechaInicio);
    this.fechaFin = new Date(savedFechaFin);

    console.log('Restored date range from localStorage:', {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
    });
  } else {
    this.fechaInicio = moment().startOf('month').toDate();
    this.fechaFin = moment().endOf('month').toDate();

    console.log('No saved date range. Using default:', {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
    });
  }

  // Fetch trades with the restored or default date range
  this.consultarTrades();
      
    
      // Initialize columns
      this.cols = [
        { field: 'id_trade', header: 'Trade ID', type: 'text' },
        { field: 'id_neg', header: 'NEG ID', type: 'text' },
        { field: 'settled', header: 'Settled', type: 'text' },
        { field: 'trade_type_name', header: 'Type', type: 'text' },
        { field: 'bank_leg', header: 'Bank Leg', type: 'text' },
        { field: 'trade_date', header: 'Trade Date', type: 'date' },
        { field: 'number_sar', header: 'SAR', type: 'text' },
        { field: 'trade_month', header: 'Month', type: 'date' },
        { field: 'instrument', header: 'Instrument', type: 'text' },
        { field: 'hedge_type', header: 'Hedge Type', type: 'text' },
        { field: 'index_name', header: 'Index', type: 'text' },
        { field: 'volume_basis', header: 'Volume Basis', type: 'text' },
        { field: 'operation', header: 'Operation', type: 'text' },
        { field: 'currency_name', header: 'Currency', type: 'text' },
        { field: 'vol_daily', header: 'Vol Daily', type: 'numeric' },
        { field: 'vol_monthly', header: 'Vol Monthly', type: 'numeric' },
        { field: 'price', header: 'Strike Price', type: 'numeric' },
        { field: 'volume_unit', header: 'Unit', type: 'text' },
        { field: 'bank', header: 'Bank', type: 'text' },
        { field: 'client', header: 'Client', type: 'text' },
        { field: 'market_price', header: 'Market Price', type: 'text' },
        { field: 'wc_price', header: 'Worst Case', type: 'numeric' },
        { field: 'bloomberg_curr', header: 'Bloomberg (CURR)', type: 'numeric' },
        { field: 'worstcase_curr', header: 'Worst Case (CURR)', type: 'numeric' },
        { field: 'mtm_usd', header: 'MTM (USD)', type: 'numeric' },
        { field: 'worstcase_usd', header: 'Worst Case (USD)', type: 'numeric' },
      ];
    
      this._selectedColumnsFilter = this.cols.map((col) => col.field);
    
      this._selectedColumns = [
        this.cols[7], // month
        this.cols[14], // volumen daily
        this.cols[15], // volumen monthly
        this.cols[16], // price
        this.cols[18], // bank
        this.cols[19], // client
        this.cols[20], // market price
      ];
    
      // Initialize default view
      const defaultView = { name: 'Default View', columns: this._selectedColumns };
      this.views.push(defaultView);
      this.activeView = defaultView;
    
      const savedViews = localStorage.getItem('tradeViews');
  if (savedViews) {
    this.views = JSON.parse(savedViews);
    this.activeView = this.views[0]; // Set the first saved view as the active one
  } else {
    const defaultView = { name: 'Default View', columns: this._selectedColumns };
    this.views.push(defaultView);
    this.activeView = defaultView;
  }
    }
    restoreNavigationState(navigationState: any): void {
    
      if (navigationState.tradesData) {
        this.products = navigationState.tradesData;
        this.filteredData = [...this.products];
      }
    
      if (navigationState.fechaInicio && navigationState.fechaFin) {
        this.fechaInicio = new Date(navigationState.fechaInicio);
        this.fechaFin = new Date(navigationState.fechaFin);
        console.log('Restored date range:', {
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
        });
      }
    }

    
    
  // Toggle create view modal
  toggleCreateView(): void {
    this.creatingView = !this.creatingView;
    this.newViewName = '';
    this.newViewColumns = [];
  }

  createView(): void {
    if (!this.newViewName || !this.newViewColumns.length) {
      this.toastr.error('Please provide a view name and select columns');
      return;
    }
    const newView = { name: this.newViewName, columns: this.newViewColumns };
    this.views.push(newView);
    this.setActiveView(newView);
    this.saveViews();
    this.creatingView = false;
    this.toastr.success('View created successfully');
  }

  deleteView(view: { name: string; columns: any[] }): void {
    const index = this.views.indexOf(view);
    if (index !== -1) {
      this.views.splice(index, 1);
      if (this.activeView === view) {
        this.activeView = this.views.length ? this.views[0] : null;
      }
      this.saveViews();
      this.toastr.success('View deleted successfully');
    }
  }
  // Cancel creating a view
  cancelCreateView(): void {
    this.creatingView = false;
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.toastr.success(`${this.selectedFile.name} selected.`);
    } else {
      this.toastr.error('No file selected.');
    }
  }
  
  

  // Set active view
  setActiveView(view: { name: string; columns: any[] }): void {
    this.activeView = view;
    this._selectedColumns = view.columns;
  }
  saveViews(): void {
    localStorage.setItem('tradeViews', JSON.stringify(this.views));
  }

  // Clear table selection
  clear(table: Table): void {
    table.clear();
    this.selectedProducts3 = [];
  }

  @Input() get selectedColumns(): any[] {     
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    //restore original order
    this._selectedColumns = this.cols.filter(col => val.includes(col));
  }  

  // src/app/trades/pages/consulta-trade/consulta.component.ts
  fetchExchangeRate(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      this.wsTrade.getBloombergRecords().subscribe(
        (bloombergRecords: any) => {
          const records = Array.isArray(bloombergRecords) ? bloombergRecords : bloombergRecords?.data;
  
          if (!records) {
            reject('No records found');
            return;
          }
  
          // Adjusted filter to match 'GBPUSD' from the database
          const pxLastValues = records
            .filter((record: any) => record?.IDENTIFIER === 'GBPUSD') // Match exact identifier as in the database
            .map((record: any) => record.PX_LAST);
  
          resolve(pxLastValues);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  saveDateRange(fechaInicio: Date, fechaFin: Date): void {
    localStorage.setItem('lastFechaInicio', fechaInicio.toISOString());
    localStorage.setItem('lastFechaFin', fechaFin.toISOString());
    console.log('Saved date range to localStorage:', { fechaInicio, fechaFin });
  }
  onDateRangeChange(newFechaInicio: Date, newFechaFin: Date): void {
    this.fechaInicio = newFechaInicio;
    this.fechaFin = newFechaFin;
  
    this.saveDateRange(this.fechaInicio, this.fechaFin);
  
    // Re-fetch trades
    this.consultarTrades();
  }
  
  
  consultarTrades() {
    this.spinner.show();
  
    const fechaInicio = this.fechaInicio.toISOString().split('T')[0]; // Format as yyyy-MM-dd
    const fechaFin = this.fechaFin.toISOString().split('T')[0];
    
    // Fetch Bloomberg Records
    this.wsTrade.getBloombergRecords().subscribe((bloombergRecords) => {
      const gbpUsdRecord = bloombergRecords.find(
        (record) => record.IDENTIFIER === 'GBPUSD Curncy'
      );
      const exchangeRate = gbpUsdRecord ? gbpUsdRecord.PX_LAST : 1.2573; // Default exchange rate if not found
      console.log('Exchange rate:', exchangeRate);
  
      // Fetch Trades
      this.wsTrade.getTrades(fechaInicio, fechaFin).subscribe((result) => {
        const trades = result.data;
  
        for (const trade of trades) {
          trade.trade_month = new Date(trade.trade_month);
          trade.trade_date = new Date(trade.trade_date);
  
          trade.index_symbol = trade.index_symbol_B;
  
          if (!trade.settled) {
            // Custom logic for Bloomberg prices
            if (trade.id_index === 57) {
              // Waha - HSC
              const wahaPrice = this.getPxLastForTradeBySymbol(
                'FFWAM',
                trade.trade_month,
                bloombergRecords
              );
              const hscPrice = this.getPxLastForTradeBySymbol(
                'FFHSM',
                trade.trade_month,
                bloombergRecords
              );
  
              if (wahaPrice !== null && hscPrice !== null) {
                trade.market_price = wahaPrice - hscPrice;
                console.log(
                  `Trade ID ${trade.id_trade}: Calculated Market Price = ${trade.market_price} (Waha - HSC)`
                );
              } else {
                console.warn(
                  `Prices for Waha or HSC not found for Trade ID ${trade.id_trade}`
                );
              }
            } else if (trade.id_index === 58) {
              // HSC Basis: HSC - HH
              const hscPrice = this.getPxLastForTradeBySymbol(
                'FFHSM',
                trade.trade_month,
                bloombergRecords
              );
              const hhPrice = this.getPxLastForTradeBySymbol(
                'NG',
                trade.trade_month,
                bloombergRecords
              );
  
              if (hscPrice !== null && hhPrice !== null) {
                trade.market_price = hscPrice - hhPrice;
                console.log(
                  `Trade ID ${trade.id_trade}: Calculated Market Price = ${trade.market_price} (HSC - HH)`
                );
              } else {
                console.warn(
                  `Prices for HSC or HH not found for Trade ID ${trade.id_trade}`
                );
              }
            } else if (trade.id_index === 59) {
              // Waha Basis: Waha - HH
              const wahaPrice = this.getPxLastForTradeBySymbol(
                'FFWAM',
                trade.trade_month,
                bloombergRecords
              );
              const hhPrice = this.getPxLastForTradeBySymbol(
                'NG',
                trade.trade_month,
                bloombergRecords
              );
  
              if (wahaPrice !== null && hhPrice !== null) {
                trade.market_price = wahaPrice - hhPrice;
                console.log(
                  `Trade ID ${trade.id_trade}: Calculated Market Price = ${trade.market_price} (Waha - HH)`
                );
              } else {
                console.warn(
                  `Prices for Waha or HH not found for Trade ID ${trade.id_trade}`
                );
              }
            } else {
              // Default Bloomberg logic for other unsettled trades
              const newMarketPrice =
                this.getPxLastForTrade(trade, bloombergRecords) ?? 0; // Default to 0 if undefined
              trade.market_price = newMarketPrice;
            }
  
            this.updateTradeMarketPriceBackend(
              trade.id_trade,
              trade.market_price
            ); // Update backend with new market price
          }
  
          // Leave market price unchanged for settled trades (lo maneja backend)
          trade.market_price =
            trade.market_price !== undefined ? trade.market_price : 0;
          this.calculateTradeFields(trade, exchangeRate); // Pass the dynamic exchange rate
        }
  
        this.products = trades;
        this.filteredData = [...trades];

        this.updateTradeValues();
        
        this.spinner.hide();
      }, error => {
        this.toastr.error('Error fetching trades');
        this.spinner.hide();
      });
    }, error => {
      this.toastr.error('Error fetching Bloomberg data');
      this.spinner.hide();
    });
    this.spinner.hide();
  } 
  
  
  calculateTradeFields(trade: ConsultaTrade, exchangeRate: number): ConsultaTrade {
    if(trade.settled === true){
      trade.wc_price = trade.market_price;
    }
    if(trade.id_operation === 2){
    trade.bloomberg_curr = ((trade.market_price - trade.price) * trade.vol_monthly)*-1;
    trade.worstcase_curr = (trade.price - trade.wc_price) * trade.vol_monthly;
    } else {
    trade.bloomberg_curr = (trade.market_price - trade.price) * trade.vol_monthly;
    trade.worstcase_curr = ((trade.price - trade.wc_price) * trade.vol_monthly)*-1;
    }  
    
    // Convert to USD if currency is not USD
    if (trade.currency_name !== 'USD') {
      trade.mtm_usd = trade.bloomberg_curr * exchangeRate;
      trade.worstcase_usd = trade.worstcase_curr * exchangeRate;
    } else {
      trade.mtm_usd = trade.bloomberg_curr;
      trade.worstcase_usd = trade.worstcase_curr;
    }
    return trade;
  }

  loadPermissions(): void {
    const json = localStorage.getItem('userPermissions');
    if (json) {
      this.permissions = JSON.parse(json);
    } else {
      this.permissions = {
        newTrade: false,
        uploadFile: false,
        settled: false,
        editTrade: false,
        actionColumn: false,
        catalogs: false
      };
    }
  }

  updateTradeValues() {
    const updates = this.products.map((trade) => ({
        idMov: trade.id_mov,
        marketPrice: parseFloat(trade.market_price.toFixed(4)), // Ensure 4 decimals
        bloombergCurr: parseFloat(trade.bloomberg_curr.toFixed(4)),
        worstcaseCurr: parseFloat(trade.worstcase_curr.toFixed(4)),
        mtmUsd: parseFloat(trade.mtm_usd.toFixed(4)),
        worstcaseUsd: parseFloat(trade.worstcase_usd.toFixed(4)),
        wc_price: parseFloat(trade.wc_price.toFixed(4)),
        
    }));

    this.wsTrade.updateCalculatedTradeValues(updates).subscribe({
        next: () => this.toastr.success('Calculated trade values updated successfully.'),
        error: (err) => this.toastr.error('Error updating trade values.'),
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
  
  
  getPxLastForTrade(trade: any, bloombergRecords: any[]): number {
    trade.index_symbol = trade.index_symbol_B;
    const recordIdentifierPrefix = trade.index_symbol.trim().toUpperCase();
  
    // Filter records matching the index symbol
    const matchingRecords = bloombergRecords.filter(
      (record) =>
        record.identifier && record.identifier.startsWith(recordIdentifierPrefix)
    );
  
  
    if (matchingRecords.length === 0) {
      // Return 0 if no matching records are found
      return 0;
    }
  
    // Filter by lastTradeableDt
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
  
    // Filter records where lastTradeableDt is within the current month
    const currentMonthRecords = matchingRecords.filter((record) => {
      const lastTradableDate = new Date(record.lastTradeableDt);
      return (
        lastTradableDate.getMonth() === currentMonth &&
        lastTradableDate.getFullYear() === currentYear
      );
    });
  
    // If lastTradeableDt is more than 2 months in the future, return current month
    const validRecord =
      currentMonthRecords.length > 0
        ? currentMonthRecords.sort(
            (a, b) => new Date(b.lastTradeableDt).getTime() - new Date(a.lastTradeableDt).getTime()
          )[0]
        : matchingRecords
            .filter(
              (record) =>
                new Date(record.lastTradeableDt).getTime() <
                today.getTime() + 60 * 24 * 60 * 60 * 1000 // 2 months ahead
            )
            .sort(
              (a, b) =>
                new Date(b.lastTradeableDt).getTime() - new Date(a.lastTradeableDt).getTime()
            )[0];
  
    // Return PX_LAST or 0 if no valid record is found
    return validRecord ? validRecord.pxLast : 0;
  }
  getPxLastForTradeBySymbol(
    symbol: string,
    tradeMonth: Date,
    bloombergRecords: any[]
  ): number | null {
    const recordIdentifierPrefix = symbol.trim().toUpperCase();
  
    // Filter records matching the index symbol
    const matchingRecords = bloombergRecords.filter(
      (record) =>
        record.identifier && record.identifier.startsWith(recordIdentifierPrefix)
    );
  
  
    if (matchingRecords.length === 0) {
      // Return null if no matching records are found
      return null;
    }
  
    // Filter by lastTradeableDt
    const validRecord = matchingRecords.find((record) => {
      const lastTradableDate = new Date(record.lastTradeableDt);
      return (
        lastTradableDate.getMonth() === tradeMonth.getMonth() &&
        lastTradableDate.getFullYear() === tradeMonth.getFullYear()
      );
    });
  
    // Return PX_LAST or null if no valid record is found
    return validRecord ? validRecord.pxLast : null;
  }  
  

updateTradeMarketPriceBackend(idTrade: number, marketPrice: number) {
  this.wsTrade.updateTradeMarketPrice(idTrade, marketPrice).subscribe({
    next: () => console.log(`Market price updated for trade ID ${idTrade}`),
  });
}

editarTrade(trade: ConsultaTrade): void {
  if (!trade.id_mov) {
    console.error('ID de trade inválido');
    return;
  }
  localStorage.setItem('lastFechaInicio', this.fechaInicio.toISOString());
  localStorage.setItem('lastFechaFin', this.fechaFin.toISOString());

  this.router.navigate(['/home/trade/step-1', trade.id_mov], { state: { trade } });
}



  settled(action: 'settle' | 'unsettle') {
    let updateSettled = this.selectedProducts3.map(product => ({ id_mov: product.id_mov, action: action }));
    //let updateSettled = [{}];
    for (var x = 0; x < this.selectedProducts3.length; x++) {
        updateSettled.push({ id_mov: this.selectedProducts3[x].id_mov, action: action });
    }

    // Call backend to update the 'settled' status of the selected trades
    if (updateSettled.length > 1) { // Ensure there's at least one trade to update
        updateSettled.splice(0, 1); // Remove initial empty object
        this.wsTrade.updateSettledStatus(updateSettled).subscribe(
            (response) => {
                // Update 'settled' status of selected trades in front-end
                this.selectedProducts3.forEach(product => product.settled = (action === 'settle'));
                this.consultarTrades();
            },
            (error) => {
                console.error('Error updating settled status:', error);
            }
        );
    } else {
        console.warn('No valid trade IDs to update.');
    }
}

uploadFile(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) {
    this.toastr.error('Please select a file to upload.');
    return;
  }
  this.selectedFile = input.files[0];
  this.toastr.success('File uploaded successfully. Click "Process File" to continue.');
}


async processFile(): Promise<void> {
  if (!this.selectedFile) {
    this.toastr.error("No file selected. Please upload a file first.");
    return;
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    const csvData = e.target!.result as string;
    let jsonData = this.csvToJson(csvData);

    jsonData = await this.cleanData(jsonData);

    console.log("Final Processed Data:", jsonData);

    // Validate before uploading
    await this.validateAndUploadTrades(jsonData);
  };

  reader.readAsText(this.selectedFile);
}

async validateAndUploadTrades(trades: any[]) {
  const lookupMappings: Record<string, { name: string; options: Record<number, string> }> = {
    sar: { name: "SAR", options: this.invertMapping(this.sarMapping) },
    counterparty: {
      name: "Counterparty",
      options: {
        ...this.invertMapping(this.bankMapping),
        ...this.invertMapping(this.plantsMapping),
      },
    },
    id_volume_basis: { name: "Volume Basis", options: this.invertMapping(this.volumeBasisMapping) },
    id_currency: { name: "Currency", options: this.invertMapping(this.currencyMapping) },
    id_trade_type: { name: "Trade Type", options: this.invertMapping(this.tradeTypeMapping) },
    id_operation: { name: "Operation", options: this.invertMapping(this.operationMapping) },
    id_instrument: { name: "Instrument", options: this.invertMapping(this.instrumentMapping) },
    id_hedge_type: { name: "Hedge Type", options: this.invertMapping(this.hedgeTypeMapping) },
    id_unit: { name: "Unit", options: this.invertMapping(this.unitMapping) },
    id_index: { name: "Index", options: this.invertMapping(this.indexMapping) },
    id_sar: { name: "SAR", options: this.invertMapping(this.sarMapping) },
  };

  for (let i = 0; i < trades.length; i++) {
    let trade = trades[i];

    const requiredFields: { key: keyof typeof lookupMappings | string; name: string; type: "string" | "number" | "date" | "boolean" | "lookup" }[] = [
      { key: "id_neg", name: "NEG ID", type: "string" },
      { key: "id_trade_type", name: "Trade Type", type: "lookup" },
      { key: "trade_date", name: "Trade Date", type: "date" },
      { key: "trade_month", name: "Trade Month", type: "date" },
      { key: "id_instrument", name: "Instrument", type: "lookup" },
      { key: "id_operation", name: "Operation", type: "lookup" },
      { key: "vol_daily", name: "Daily Volume", type: "number" },
      { key: "vol_monthly", name: "Monthly Volume", type: "number" },
      { key: "price", name: "Price", type: "number" },
      { key: "id_currency", name: "Currency", type: "lookup" },
      { key: "counterparty", name: "Counterparty", type: "lookup" },
      { key: "id_volume_basis", name: "Volume Basis", type: "lookup" },
      { key: "settled", name: "Settled", type: "boolean" },
      { key: "id_sar", name: "SAR", type: "lookup" },
      { key: "bank_leg", name: "Bank Leg", type: "boolean" },
      { key: "id_unit", name: "Unit", type: "lookup" },
      // wc_price? markeprice y todos esos
    ];

    // Optional fields (notify user, but allow skipping)
  const optionalFields: { key: string; name: string; type: "string" | "number" | "date" | "boolean" | "lookup" }[] = [
    { key: "market_price", name: "Market Price", type: "number" },
    { key: "wc_price", name: "Worst Case Price", type: "number" },
    { key: "bloomberg_curr", name: "Bloomberg Currency", type: "number" },
  ];

    for (const field of  [...requiredFields, ...optionalFields]) {
      let value = trade[field.key];

      let isInvalid =
        value === null ||
        value === undefined ||
        value === "" ||
        (field.type === "number" && (isNaN(Number(value)) || value === "")) ||
        (field.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) ||
        (field.type === "boolean" && (value === null || value === undefined || value === "" || (value !== 1 && value !== 0)));
        (field.type === "lookup" && !lookupMappings[field.key as keyof typeof lookupMappings]?.options[value]);

      if (isInvalid) {
        while (true) {
          let optionsMessage = "";
          if (field.type === "lookup") {
            const lookup = lookupMappings[field.key as keyof typeof lookupMappings];
            optionsMessage = `Valid options:\n${Object.entries(lookup.options)
              .map(([id, name]) => `${id}: ${name}`)
              .join("\n")}`;
          }

          let promptMessage = 
            `Trade ID: ${trade.id_neg} has an error in ${field.name}.\n\n` +
            `Current value: ${value === null ? "[EMPTY]" : value}\n` +
            `${optionsMessage ? optionsMessage + "\n" : ""}` +
            `${field.type === "date" ? "Expected format: YYYY-MM-DD" : ""}\n` +
            `${field.type === "boolean" ? "Enter 1 for Yes, 0 for No." : ""}\n` +
            `Enter a new valid value or type "skip" to leave empty:`;

            let newValue = prompt(promptMessage);

            if (newValue === null) {
              this.toastr.warning("Trade processing canceled.");
              return;
            }
  
            if (newValue.toLowerCase() === "skip" && optionalFields.some(f => f.key === field.key)) {
              // If the user chooses to skip an optional field, move to the next field
              break;
            }  

          if (field.type === "number" && (isNaN(Number(newValue)) || newValue === "")) {
            alert("Invalid input. Please enter a valid number.");
          } else if (field.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(newValue)) {
            alert("Invalid date format. Use YYYY-MM-DD.");
          } else if (field.type === "boolean") {
              while (newValue !== "0" && newValue !== "1") {
                alert("Invalid input. Enter 1 for Yes (Settled, x), 0 for No (Unsettled).");
                newValue = prompt(
                  `Trade ID: ${trade.id_neg} has an error in ${field.name}.\n\n` +
                  `Current value: ${value === null || value === undefined ? "[EMPTY]" : value}\n\n` +
                  `Enter 1 for Yes (Settled, x) or 0 for No (Unsettled):`
                );
            
                if (newValue === null) {
                  this.toastr.warning("Trade processing canceled.");
                  return;
                }
              }
              trade[field.key] = Number(newValue); // Convert string "1"/"0" to number
              break; // Move to the next field      
          } else if (field.type === "lookup" && !lookupMappings[field.key as keyof typeof lookupMappings]?.options[Number(newValue)]) {
            alert("This value does not exist in the database. Please select one from the valid options.");
          } else {
            // Assign the valid new value correctly
            trade[field.key] = field.type === "number" ? Number(newValue) : newValue;
            break; // Move to the next field
          }
          
        }
      }
    }
  }

  // Proceed to upload if all trades pass validation
  this.uploadTradeFile(trades);
}


/**
 * Utility function to invert a mapping (swap keys and values)
 */
private invertMapping(mapping: Record<string, number>): Record<number, string> {
  return Object.keys(mapping).reduce((acc, key) => {
    acc[mapping[key]] = key;
    return acc;
  }, {} as Record<number, string>);
}



// **Improved Validation Function**
validateTrade(trade: any): string | null {
  if (!trade.trade_date || !this.isValidDate(trade.trade_date)) {
    return "Invalid trade_date. Expected format: YYYY-MM-DD";
  }
  if (!trade.price || !this.isValidNumber(trade.price)) {
    return "Invalid price. Expected a valid number.";
  }
  if (!trade.vol_monthly || !this.isValidNumber(trade.vol_monthly)) {
    return "Invalid vol_monthly. Expected a valid integer.";
  }
  return null;
}

// **Strict Date Validation**
isValidDate(dateString: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !isNaN(Date.parse(dateString));
}

// **Strict Number Validation**
isValidNumber(value: any): boolean {
  return !isNaN(value) && value !== "" && value !== null;
}

// Extract original field value
getTradeFieldValue(trade: any, errorMessage: string): string | null {
  if (errorMessage.includes("trade_date")) return trade.trade_date || null;
  if (errorMessage.includes("price")) return trade.price !== undefined ? trade.price.toString() : null;
  if (errorMessage.includes("vol_monthly")) return trade.vol_monthly !== undefined ? trade.vol_monthly.toString() : null;
  return null;
}

// Validate & update field value
updateTradeField(trade: any, errorMessage: string, newValue: string): string | null {
  if (errorMessage.includes("trade_date")) {
    if (this.isValidDate(newValue)) {
      trade.trade_date = newValue;
      return null;
    }
    return "Please enter a date in YYYY-MM-DD format.";
  }

  if (errorMessage.includes("price")) {
    if (this.isValidNumber(newValue)) {
      trade.price = parseFloat(newValue);
      return null;
    }
    return "Price must be a valid number.";
  }

  if (errorMessage.includes("vol_monthly")) {
    if (this.isValidNumber(newValue)) {
      trade.vol_monthly = parseInt(newValue, 10);
      return null;
    }
    return "Volume must be a valid integer.";
  }

  return null;
}

// Upload cleaned trade data
uploadTradeFile(trades: any[]): void {
  const formData = new FormData();
  const csvString = this.convertJsonToCsv(trades);
  const csvBlob = new Blob([csvString], { type: "text/csv" });

  formData.append("file", csvBlob, "trades.csv");

  this.wsTrade.uploadTradeFile(formData).subscribe(
    (response) => {
      this.toastr.success("Trades uploaded successfully.");
    },
    (error) => {
      this.toastr.error("Error uploading trades.");
    }
  );
}

async handleInvalidTrades(invalidTrades: any[], validTrades: any[]): Promise<void> {
  let index = 0;

  while (index < invalidTrades.length) {
    let { trade, error } = invalidTrades[index];

    // First Prompt: Ask the user to edit or cancel
    const userAction = await this.promptUserAction(trade, error);

    if (userAction === "cancel") {
      this.toastr.info("Upload process terminated by user.");
      return; // 
    }

    if (userAction === "edit") {
      // 
      const editedTrade = await this.promptUserToEdit(trade, error);

      if (editedTrade === null) {
        this.toastr.info("Upload process terminated by user.");
        return; // STOP processing if user cancels
      }

      //  **Immediately remove trade from error list BEFORE revalidating**
      invalidTrades.splice(index, 1); 

      //  **Revalidate the edited trade**
      const newError = this.validateTrade(editedTrade);

      if (!newError) {
        validTrades.push(editedTrade); 
        continue; // 🔄 Move to the next trade
      } else {
        // Still invalid? Reinsert into error list & update error message
        invalidTrades.splice(index, 0, { trade: editedTrade, error: newError });
      }
    }
  }

  if (validTrades.length > 0) {
    this.toastr.success(`All errors fixed. Uploading ${validTrades.length} trades.`);
    await this.uploadValidTrades(validTrades);
  } else {
    this.toastr.warning("No valid trades to upload. Process canceled.");
  }
}


async promptUserAction(trade: any, errorMessage: string): Promise<string> {
  return new Promise((resolve) => {
    const userChoice = window.prompt(
      `Trade ID: ${trade.id_neg} has an error: ${errorMessage}\n\nChoose an option:\n
      - Type "edit" to modify the trade.
      - Type "cancel" to stop processing.`,
      "edit" // Default action
    );

    if (userChoice?.toLowerCase() === "cancel") {
      resolve("cancel");
    } else {
      resolve("edit");
    }
  });
}

async promptUserToEdit(trade: any, errorMessage: string): Promise<any> {
  return new Promise((resolve) => {
    let newTrade = { ...trade }; // Create a copy of the trade to modify

    while (true) {
      let newValue = window.prompt(
        `Trade ID: ${trade.id_neg} has an error: ${errorMessage}\n\n` +
        `Please enter a valid value. \n` +
        `For dates, use format: YYYY-MM-DD (e.g., 2025-03-18).\n` +
        `For numbers, ensure it is a valid integer or decimal.\n`,
        trade.trade_date || "" // Pre-fill with current value if applicable
      );

      if (newValue === null) {
        resolve(null); // User canceled edit
        return;
      }

      // If the error is a date issue, validate date format
      if (errorMessage.toLowerCase().includes("date")) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Matches YYYY-MM-DD
        if (!dateRegex.test(newValue)) {
          alert("Invalid date format. Please enter in YYYY-MM-DD format (e.g., 2025-03-18).");
          continue; // Re-prompt for a valid date
        }
      }

      // Assign the valid value and exit loop
      newTrade.trade_date = newValue;
      resolve(newTrade);
      return;
    }
  });
}

async uploadValidTrades(trades: any[]): Promise<void> {
  if (trades.length === 0) {
    this.toastr.warning("No valid trades to upload.");
    return;
  }

  // Ensure no NULL values before sending
  const cleanedTrades = trades.map(trade => {
    return {
      ...trade,
      trade_date: trade.trade_date || new Date().toISOString().split("T")[0], // Default to today if empty
      id_neg: trade.id_neg || "UNKNOWN", // Ensure required fields exist
    };
  });

  const formData = new FormData();
  const csvString = this.convertJsonToCsv(cleanedTrades);
  const csvBlob = new Blob([csvString], { type: "text/csv" });

  formData.append("file", csvBlob, "trades.csv");

  this.wsTrade.uploadTradeFile(formData).subscribe(
    (response) => {
      this.toastr.success("Trades uploaded successfully!");
    },
    (error) => {
      console.error("Upload Error:", error);
      this.toastr.error("Error uploading trades. Please check logs.");
    }
  );
}


async editTrade(trade: any): Promise<void> {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.innerHTML = `
      <div class="edit-modal">
        <p>🛠 Fix Trade ID: ${trade.id_neg}</p>
        <label>Trade Date: <input id="edit-trade_date" type="date" value="${trade.trade_date}"></label>
        <label>Bloomberg Curr: <input id="edit-bloomberg_curr" type="text" value="${trade.bloomberg_curr}"></label>
        <button id="save">Save</button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("save")!.addEventListener("click", () => {
      trade.trade_date = (document.getElementById("edit-trade_date") as HTMLInputElement).value;
      trade.bloomberg_curr = parseFloat(
        (document.getElementById("edit-bloomberg_curr") as HTMLInputElement).value || "0"
      );

      document.body.removeChild(modal);
      resolve();
    });
  });
}



csvToJson(csvString: string): any[] {
  csvString = csvString.replace(/^\ufeff/, ''); // Remove BOM to avoid encoding issues

  // Parse CSV using PapaParse (Auto-detect delimiter)
  const parsedResult = Papa.parse(csvString, {
    header: true,         // Extract headers automatically
    skipEmptyLines: true, // Ignore empty lines
    dynamicTyping: false, // Keep original string values
  });

  const parsedData = parsedResult.data as Record<string, string>[]; // Ensure it's an array of objects

  // Ensure data was parsed correctly
  if (!Array.isArray(parsedData) || parsedData.length === 0) {
    console.error("CSV Parsing Failed: No data found.");
    return [];
  }

  // Normalize Headers (Remove Line Breaks, Trim Spaces, and Fix Formatting)
  const rawHeaders = Object.keys(parsedData[0]).map(header =>
    header
      .trim()                // Trim spaces
      .replace(/\s+/g, " ")  // Replace multiple spaces and newlines
      .replace(/\n/g, " ")   // Ensure no line breaks in headers
      .replace(/[↵]/g, "")   // Remove any lingering `↵` characters
      .toLowerCase()
  );

  // Ensure Unique Headers (Avoid Duplicate Column Names)
  const seenHeaders = new Map();
  const uniqueHeaders = rawHeaders.map(header => {
    if (seenHeaders.has(header)) {
      let count = seenHeaders.get(header) + 1;
      seenHeaders.set(header, count);
      return `${header}_${count}`; // Rename duplicates (e.g., "bloomberg" → "bloomberg_2")
    } else {
      seenHeaders.set(header, 1);
      return header;
    }
  });

  // Define Column Mappings (CSV Header → Backend Field)
  const columnMappings: Record<string, string> = {
    "settled": "settled",
    "iferc/daily": "id_volume_basis",
    "trade type": "id_trade_type",
    "bank leg": "bank_leg",
    "counterparty": "id_bank",
    "id": "id_neg",
    "trade date": "trade_date",
    "sar": "id_sar",
    "group": "id_plant",
    "month": "trade_month",
    "instrument": "id_instrument",
    "hedge type": "id_hedge_type",
    "index": "id_index",
    "opertation": "id_operation",
    "volume (unit/d)": "vol_daily",
    "unit": "id_unit",
    "price (curr/unit)": "price",
    "currency": "id_currency",
    "total vol (unit)": "vol_monthly",

    // Bloomberg & Worst Case Columns (Fixed Format)
    "bloomberg (curr/unit)": "market_price",
    "bloomberg (curr)": "bloomberg_curr",
    "mtm (usd)": "mtm_usd",
    "worst case (curr)": "worstcase_curr",
    "worst case (usd)": "worstcase_usd",
    "worst case (curr/unit)": "wc_price"
  };

  // Convert CSV Data to JSON Using Mapped Headers
  return parsedData.map(row => {
    const obj: Record<string, any> = {};

    Object.entries(row).forEach(([header, rawValue]) => {
      // Normalize Header (Remove Extra Spaces & Newlines)
      const cleanedHeader = header
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\n/g, " ")
        .replace(/[↵]/g, "")
        .toLowerCase();

      const mappedHeader = columnMappings[cleanedHeader]; // Match cleaned header

      if (mappedHeader) {
        // Fix Large Numbers (`"9,000"` → `9000`)
        if (["vol_daily", "vol_monthly", "price", "market_price", "wc_price", "worstcase_curr", "mtm_usd", "worstcase_usd"].includes(mappedHeader)) {
          rawValue = rawValue ? rawValue.replace(/,/g, "") : "0"; // Remove thousands separator
          rawValue = isNaN(parseFloat(rawValue)) ? "0.00" : parseFloat(rawValue).toFixed(2); // Ensure two decimals
        }

        // Convert ID Fields to Numbers
        if (["id_neg", "id_bank", "id_sar", "id_plant", "id_trade_type", "id_index", "id_operation", "id_unit", "id_currency", "id_volume_basis"].includes(mappedHeader)) {
          rawValue = rawValue && !isNaN(Number(rawValue.replace(/,/g, ""))) 
            ? parseInt(rawValue.replace(/,/g, ""), 10).toString() 
            : rawValue;
        }

        // Fix Trade Month Date Format (`21-Nov` → `2021-11-01`)
        if (mappedHeader === "trade_month" && rawValue) {
          const match = rawValue.match(/(\d{2})-([A-Za-z]{3})/);
          if (match) {
            const [_, year, month] = match;
            const monthMap: Record<string, string> = {
              "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
              "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",
              "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
            };
            if (month in monthMap) {
              rawValue = `20${year}-${monthMap[month]}-01`; // Convert to `YYYY-MM-DD`
            }
          }
        }

        // Fix Trade Date Format (`10/22/2021` → `2021-10-22`)
        if (mappedHeader === "trade_date" && rawValue) {
          const match = rawValue.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          if (match) {
            const [_, month, day, year] = match;
            rawValue = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`; // Convert to `YYYY-MM-DD`
          }
        }

        // Handle Missing Values by Defaulting to `null`
        if (rawValue === "" || rawValue === undefined || rawValue === "NaN") {
          rawValue = null as unknown as string;
        }

        obj[mappedHeader] = rawValue;
      }
    });

    return obj;
  }).filter(row => row.id_neg !== null && row.id_neg !== "%"); // Remove invalid rows
}


cleanData(data: any[]): any[] {
  return data.map(row => {
    const idOperation = this.operationMapping[row["id_operation"]] ?? row["id_operation"] ?? null;

    let idBank: number | null = this.bankMapping[row["id_bank"]] ?? row["id_bank"] ?? null;
    let idPlant: number | null = this.plantsMapping[row["id_plant"]] ?? row["id_plant"] ?? null;

    if (idOperation === 1) {
      idPlant = null; // If id_operation is 1, id_plant should be null
    } else if (idOperation === 2) {
      idBank = null; // If id_operation is 2, id_bank should be null
    }
    
    let counterparty: number | null = idBank !== null ? idBank : idPlant;

    return {
      id_neg: row["id_neg"],
      settled: row["settled"]?.toLowerCase() === "yes" ? 1 : 
         row["settled"]?.toLowerCase() === "no" ? 0 : row["settled"],
      id_trade_type: this.tradeTypeMapping[row["id_trade_type"]] ?? row["id_trade_type"],
      bank_leg: row["bank_leg"]?.toLowerCase() === "x" ? 1 : 
        row["bank_leg"] === "" ? 0 : row["bank_leg"],
      trade_date: row["trade_date"] || null,
      id_sar: this.sarMapping[row["id_sar"]] ?? row["id_sar"] ?? null,
      trade_month: row["trade_month"] || null,
      id_instrument: this.instrumentMapping[row["id_instrument"]] ?? row["id_instrument"] ?? null,
      id_hedge_type: this.hedgeTypeMapping[row["id_hedge_type"]] ?? row["id_hedge_type"] ?? null,
      id_index: this.indexMapping[row["id_index"]] ?? row["id_index"] ?? null,
      id_volume_basis: this.volumeBasisMapping[row["id_volume_basis"]] ?? row["id_volume_basis"] ?? null,
      id_operation: this.operationMapping[row["id_operation"]] ?? row["id_operation"] ?? null,
      id_currency: this.currencyMapping[row["id_currency"]] ?? row["id_currency"] ?? null,
      vol_daily: row["vol_daily"] ? parseFloat(row["vol_daily"].replace(/,/g, "")) : null,
      vol_monthly: row["vol_monthly"] ? parseFloat(row["vol_monthly"].replace(/,/g, "")) : null,
      price: row["price"] ? parseFloat(row["price"].replace(",", "")).toFixed(2) : null,
      id_unit: this.unitMapping[row["id_unit"]] ?? row["id_unit"] ?? null,
      id_plant: idPlant,
      id_bank: idBank,
      counterparty: counterparty,
      market_price: row["market_price"] === "NaN" ? "0.00" : parseFloat(row["market_price"].replace(",", "")).toFixed(2),
      bloomberg_curr: row["bloomberg_curr"] === "NaN" ? "0.00" : parseFloat(row["bloomberg_curr"].replace(",", "")).toFixed(2),
      worstcase_curr: row["worstcase_curr"] === "NaN" ? "0.00" : parseFloat(row["worstcase_curr"].replace(",", "")).toFixed(2),
      mtm_usd: row["mtm_usd"] === "NaN" ? "0.00" : parseFloat(row["mtm_usd"].replace(",", "")).toFixed(2),
      worstcase_usd: row["worstcase_usd"] === "NaN" ? "0.00" : parseFloat(row["worstcase_usd"].replace(",", "")).toFixed(2),
      wc_price: row["wc_price"] === "NaN" ? "0.00" : parseFloat(row["wc_price"].replace(",", "")).toFixed(2),
    };
  });
}


uploadCleanedData(cleanedData: any[]): void {
  const formData = new FormData();

  // Convert JSON to CSV
  const csvString = this.convertJsonToCsv(cleanedData);
  const csvBlob = new Blob([csvString], { type: "text/csv" });

  // Append the CSV file with the correct filename
  formData.append("file", csvBlob, "trades.csv");

  // Log the payload before sending
  console.log("Sending FormData to Backend:", formData.get("file"));

  this.wsTrade.uploadTradeFile(formData).subscribe(
    (response) => {
      console.log("Upload Success:", response);

      if (typeof response === "string" && response.includes("trades processed successfully")) {
        this.toastr.success(response);
      } else {
        this.toastr.warning("Upload completed, but verify data.");
      }

      this.selectedFile = null;
    },
    (error) => {
      console.error("Upload Error:", error);
      this.toastr.error("Error uploading data.");
    }
  );
}


convertJsonToCsv(data: any[]): string {
  if (!data.length) return "";

  // Extract headers from the first object
  const headers = Object.keys(data[0]);

  // Convert data to CSV format
  const csvRows = [
    headers.join(","), // Header row
    ...data.map(row =>
      headers.map(header => `"${(row[header] ?? "").toString().replace(/"/g, '""')}"`).join(",")
    )
  ];

  return csvRows.join("\n");
}
  
}

