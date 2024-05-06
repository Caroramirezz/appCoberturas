import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TradesService } from '../../services/trades.service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ConsultaTrade } from '../../interfaces/consulta-trade.interface';


@Component({
  selector: 'app-solicitudes',
  templateUrl: './consulta.component.html',
  styleUrls: ['./consulta.component.scss']
})
export class ConsultaTradeComponent implements OnInit {
  
  //Filters
  fechaInicio = moment().startOf('month').toDate();
  fechaFin = moment().endOf('month').toDate();

  products:ConsultaTrade[] = [];  

  cols: any[] = [];  

  _selectedColumns: any[] = [];
  _selectedColumnsFilter:any[] = [];
  
  selectedProducts3:ConsultaTrade[] = [];

  constructor(
      private wsTrade:TradesService,
      private router:Router,          
      private spinner: NgxSpinnerService,    
      private toastr: ToastrService,  
    ){
      
    }

  ngOnInit(): void {
    //Estas son las columnas que necesito poner en el dropdown list.    
    this.cols = [
      { field: 'id_trade', header: 'Trade ID', type:"text" },
      { field: 'id_neg', header: 'NEG ID', type:"text" },
      { field: 'settled', header: 'Settled', type:"text" },
      { field: 'trade_type_name', header: 'Type', type:"text" },
      { field: 'bank_leg', header: 'Bank Leg', type:"text" },
      { field: 'trade_date', header: 'Trade Date', type:"date" },
      { field: 'number_sar', header: 'SAR', type:"text" },
      { field: 'trade_month', header: 'Month', type:"date" },
      { field: 'instrument', header: 'Instrument', type:"text" },
      { field: 'hedge_type', header: 'Hedge Type', type:"text" },
      { field: 'index_name', header: 'Index', type:"text" },   
      { field: 'volume_basis', header: 'Volume Basis', type:"text" },
      { field: 'operation', header: 'Operation', type:"text" },
      { field: 'currency_name', header: 'Currency', type:"text" },
      { field: 'vol_daily', header: 'Vol Daily', type:"numeric" },
      { field: 'vol_monthly', header: 'Vol Monthly', type:"numeric" },
      { field: 'price', header: 'Strike Price', type:"numeric" },
      { field: 'volume_unit', header: 'Unit', type:"text" },
      { field: 'bank', header: 'Bank', type:"text" },
      { field: 'client', header: 'Client', type:"text" },
      { field: 'effective_price', header: 'Market Price', type:"text" },      
    ];

    //Tengo que traer todas las columnas que ocupare.
    for(var x = 0; x < this.cols.length; x++){
      this._selectedColumnsFilter.push(this.cols[x].field);
    }

    //Mapear desde un principio estas 6 columnas. 
    this._selectedColumns.push(this.cols[7]); // month
    this._selectedColumns.push(this.cols[14]); // volumen daily
    this._selectedColumns.push(this.cols[15]); // volumen monthly
    this._selectedColumns.push(this.cols[16]); // price
    this._selectedColumns.push(this.cols[18]); // bank
    this._selectedColumns.push(this.cols[19]); // client
  }  

  clear(table: Table) {
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

  consultarTrades(){
    this.spinner.show();

    this.wsTrade.getTrades(this.fechaInicio, this.fechaFin).subscribe(result => {
      console.log(result);
      for(var x = 0; x < result.data.length; x++){
        result.data[x].trade_month = new Date(result.data[x].trade_month);
        result.data[x].trade_date = new Date(result.data[x].trade_date);
      }
      this.products = result.data;
 
      this.spinner.hide();
    },
    error => {
      this.toastr.error('Error WS', '', {
        timeOut: 5000,
      });  
      this.spinner.hide();
    });
  }

  editarTrade(value:ConsultaTrade){
    this.router.navigate(['/home/trade/step-1', value.id_trade]); 
  }

  settled(action: 'settle' | 'unsettle') {
    console.log(this.selectedProducts3);
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
                console.log(response); // Success
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

  
}

