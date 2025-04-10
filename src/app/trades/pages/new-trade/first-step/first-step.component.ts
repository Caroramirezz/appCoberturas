import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ListTrade, TradeInterface } from 'src/app/trades/interfaces/trade.interface';
import { TradesService } from 'src/app/trades/services/trades.service';
import { ListPlants } from 'src/app/trades/interfaces/trade.interface';

@Component({
  selector: 'app-first-step',
  templateUrl: './first-step.component.html',
  styleUrls: ['./first-step.component.scss']
})
export class FirstStepComponent implements OnInit {
  public formFirstStep:FormGroup;
  modoView:string = 'New';
  title:string = 'New Trade';
  trade_object:TradeInterface = {} as TradeInterface; 
  dataTable:ListTrade[] = [];
  periodsAux:any[] = [];
  fechaTrade:Date = new Date();
  trade_id:string = "";
  fechaInicio = moment().startOf('month').toDate();
  fechaFin = moment().endOf('month').toDate();
  products:any[] = [];

  //Variables de apoyo
  objectDatesList:any[] = [];
  //Crear DataSource 
  dataSource = new MatTableDataSource()
  displayedColumns = ['date', 'vol_daily', 'vol_monthly', 'price'];

  fill_down:boolean = false;  
  fill_down_price:boolean = false;


  //FILTROS
  listTradesType:any[] = [];
  listBanks:any[] = [];  
  listSars:any[] = [];  
  listInstruments:any[] = [];  
  listHedgeTypes:any[] = [];  
  listIndexes:any[] = [];
  listVolumeBasis:any[] = [];
  listUnits:any[] = [];  
  listCurrency:any[] = [];  
  listOperations:any[] = [];


  constructor(
    private router:Router,
    private tradesService: TradesService,
    private route: ActivatedRoute,
    private wsTrade:TradesService,
    public fb: FormBuilder,  
    private spinner: NgxSpinnerService,    
    private toastr: ToastrService,  
  ) { 

    this.formFirstStep = this.fb.group({
      'trade_date': new FormControl(new Date(), [Validators.required]),      
      'id_trade_type': new FormControl(null, [Validators.required]), 
      'id_bank': new FormControl(null, [Validators.required]), 
      'id_trade': new FormControl(null, [Validators.required]), 
      'id_sar': new FormControl(null, [Validators.required]), 
      'fechaInicio': new FormControl(this.fechaInicio, [Validators.required]), 
      'fechaFin': new FormControl(this.fechaFin, [Validators.required]), 
      'id_instrument': new FormControl(null, [Validators.required]), 
      'id_hedge_type': new FormControl(null, [Validators.required]), 
      'id_index': new FormControl(null, [Validators.required]), 
      'id_volume_basis': new FormControl(null, [Validators.required]), 
      'id_unit': new FormControl(null, [Validators.required]), 
      'id_currency': new FormControl(null, [Validators.required]), 
      'id_operation': new FormControl(null, [Validators.required]),
      
    });    

  }

  ngOnInit(): void {
    this.spinner.show();
   
    //Consultas de filtros
    this.getTradeTypes();
    this.getListBanks();
    this.getListCurrency();
    this.getListHedgeTypes();
    this.getListInstruments();
    this.getListOperationTypes();
    this.getListSars();
    this.getListVolumeBasis();
    this.getListIndexTypes();
    this.getListVolumeUnits();
    //Jalar ID de la URL
    this.route.params.subscribe(params => {
      if(params['id']){
        this.trade_id = params['id']; // Access the 'id' parameter from the URL
        this.modoView = 'Edit';
        this.title = 'Edit Trade: ' + this.trade_id;
      }      
    });

    const tradeData = history.state.trade;

    if (this.modoView === 'New') {
      let dataService: TradeInterface = this.wsTrade.getValuesTrade();
      if (Object.keys(dataService).length > 0) {
          this.populateFormAndTable(dataService);
      }
  }

  if (tradeData) {
      this.modoView = 'Edit';
      this.title = `Edit Trade: ${tradeData.id_trade}`;
      this.populateFormAndTable(tradeData);
  } else {
      this.route.params.subscribe((params) => {
          if (params['id']) {
              this.trade_id = params['id'];
              this.modoView = 'Edit';
              this.title = 'Edit Trade: ' + this.trade_id;
              this.GetTradeWithId();
          }
      });
  }

    this.spinner.hide();
  }


  // CONSULTAS BASICAS - INFORMACION DEL TRADE

  getTradeTypes(){
    this.wsTrade.getListTradeTypes().subscribe(result => {      
      this.listTradesType = result.data;
    }, error => {
      console.log(error);
    })
  }

  getListBanks(){
    this.wsTrade.getListBanks().subscribe(result => {      
      this.listBanks = result.data;
    }, error => {
      console.log(error);
    })
  }

  getListCurrency(){
    this.wsTrade.getListCurrency().subscribe(result => {      
      this.listCurrency = result.data;
    }, error => {
      console.log(error);
    })
  }

  getListHedgeTypes(){
    this.wsTrade.getListHedgeTypes().subscribe(result => {      
      this.listHedgeTypes = result.data;
    }, error => {
      console.log(error);
    })
  }

  getListInstruments(){
    this.wsTrade.getListInstruments().subscribe(result => {      
      this.listInstruments = result.data;
    }, error => {
      console.log(error);
    })
  }


  getListOperationTypes(){
    this.wsTrade.getListOperationTypes().subscribe(result => {    
      this.listOperations = result.data;
    }, error => {
      console.log(error);
    })
  }

  getListSars(){
    this.wsTrade.getListSars().subscribe(result => {      
      this.listSars = result.data;
    }, error => {
      console.log(error);
    })
  }

  getListVolumeBasis(){
    this.wsTrade.getListVolumeBasis().subscribe(result => {      
      this.listVolumeBasis = result.data;
    }, error => {
      console.log(error);
    })
  }

  getListIndexTypes(){
    this.wsTrade.getListIndexTypes().subscribe(result => {      
      this.listIndexes = result.data;
    }, error => {
      console.log(error);
    })
  }

  getListVolumeUnits(){
    this.wsTrade.getListVolumeUnits().subscribe(result => {      
      this.listUnits = result.data;
    }, error => {
      console.log(error);
    })
  }
  //AQUI TERMINA LAS CONSULTAS BASICAS - INFORMACION TRADE


  GetTradeWithId() {
    this.spinner.show();

    this.wsTrade.getTradeWithId(this.trade_id).subscribe(
        (result) => {

          if (result && result.data && result.data.length > 0) {
            this.products = result.data; // Populate products with trade data
            console.log('Fetched trades data:', this.products); // Debugging log
          } else {
            console.warn('No trades data found for the given trade ID.');
          }
            if (result && result.data && result.data.length > 0) {
                console.log('Fetched trade data:', result.data);

                // Obtain the range of the period
                let datesPeriod: Date[] = [];
                let period: any[] = [];

                for (let y = 0; y < result.data.length; y++) {
                    if (!result.data[y].id_neg || result.data[y].id_neg === '') {
                        datesPeriod.push(result.data[y].trade_month);
                        period.push(result.data[y]);
                    }
                }

                // Reset form and dataTable
                this.formFirstStep.reset(); // Clear previous data
                this.dataTable = []; // Clear previous dataTable entries

                // Map to basic form fields
                this.formFirstStep.patchValue({
                    trade_date: result.data[0].trade_date,
                    id_trade_type: result.data[0].id_trade_type,
                    id_bank: result.data[0].id_bank,
                    id_trade: result.data[0].id_trade,
                    id_sar: result.data[0].id_sar,
                    fechaInicio: datesPeriod[0],
                    fechaFin: datesPeriod[datesPeriod.length - 1],
                    id_instrument: result.data[0].id_instrument,
                    id_hedge_type: result.data[0].id_hedge_type,
                    id_index: result.data[0].id_index,
                    id_volume_basis: result.data[0].id_volume_basis,
                    id_unit: result.data[0].id_unit,
                    id_currency: result.data[0].id_currency,
                    id_operation: result.data[0].id_operation,
                });

                // Populate periodsAux and dataTable
                this.periodsAux = period.map((p) => ({
                    date: p.trade_month ? new Date(p.trade_month) : null,
                    vol_daily: Math.trunc(p.vol_daily || 0),
                    vol_monthly: Math.trunc(p.vol_monthly || 0),
                    price: p.price || 0,
                    month: p.month || null,
                    days: p.days || null,
                }));

                this.dataTable = [...this.periodsAux];
                this.dataSource.data = this.dataTable;

                console.log('Periods populated:', this.periodsAux);

                this.spinner.hide();
            } else {
                this.toastr.error('No data found for the selected trade.', '', {
                    timeOut: 5000,
                });
                this.spinner.hide();
            }
        },
        (error) => {
            console.error('Error fetching trade data:', error);
            this.spinner.hide();
            this.toastr.error('Error fetching trade data. Please try again.', '', {
                timeOut: 5000,
            });
        }
    );
}

  //BUTTON CREATE LIST-TRADE POR PERIODO
  createList(){
    this.spinner.show();
    //Validar que se cumpla el form
    if(this.formFirstStep.valid){
      //Limpiar variables
      this.dataTable = [];
      this.objectDatesList = [];
              
      this.fechaInicio = this.formFirstStep.controls['fechaInicio'].value;
      this.fechaFin = this.formFirstStep.controls['fechaFin'].value;
  
      //Obtiene diferencia de meses entre las fechas y se aumenta (+1) para contar el mes donde arrancó el rango de fechas. 
      let months = moment(this.fechaFin).diff(moment(this.fechaInicio), 'months') + 1;      
  
      //Ya tengo la cantidad de meses. Ahora, con la fecha inicio, debo ir recorriendo con un for hasta el numero de meses; con esto sabre cuales meses hay entre el rango de fechas y sus días. 
  
      var objectDates = [];
      var primeraVez = true;
      var position = 0;
      for(var x = 0; x < months; x++){
  
        if(primeraVez){
          let month = moment(this.fechaInicio).get('month');
          let days = moment(this.fechaInicio).daysInMonth();
          let date = moment().set({'year': moment(this.fechaInicio).get('year'), 'month': month, 'date': 1})
  
          objectDates.push({
            position:position,
            month:month,
            days: days,
            date: date
          });
  
          primeraVez = false; 
          continue;
        }
  
        if(x != months){
          //aumenta la posición
          position++;
  
          //Identificar el mes
          let mesTemp = moment(this.fechaInicio).add(x, 'months');
  
          let month = moment(mesTemp).get('month');
          let days = moment(mesTemp).daysInMonth();
          let date = moment().set({'year': moment(mesTemp).get('year'), 'month': month, 'date': 1})
  
          //Meter al objeto
          objectDates.push({
            position:position,
            month: month,
            days: days,
            date:date
          });
        }      
      }
  
      //Pasar a variable publica
      this.objectDatesList = [...objectDates];
      
      //Necesito de columnas 'date', 'volumen diario', volumen mensual y price
  
      for(var x = 0; x < this.objectDatesList.length; x++){
  
        this.dataTable.push(
          {
            position:this.objectDatesList[x].position,
            date: new Date(this.objectDatesList[x].date),
            vol_daily:0,
            vol_monthly:0,
            price:0,
            month:this.objectDatesList[x].month,
            days:this.objectDatesList[x].days
          }
        );          
      }   
      
      
      //Esto aplica para el modo "Edición"
      if(this.modoView === 'Edit'){

        for(var y = 0; y < this.periodsAux.length; y++){
          //if((this.periodsAux[y].id_neg == '' || this.periodsAux[y].id_neg == undefined) && this.periodsAux.length == this.dataTable.length){
          if((this.periodsAux[y].id_neg == '' || this.periodsAux[y].id_neg == undefined)){
            this.dataTable[y].vol_daily = this.periodsAux[y].vol_daily;
            this.dataTable[y].vol_monthly = this.periodsAux[y].vol_monthly;
            this.dataTable[y].price = this.periodsAux[y].price;          
          }           
        }  
        
      }
      
      console.log(this.dataTable)
      this.spinner.hide();
    } 

    //Mandar alerta.
    else {
      this.toastr.error('Favor de completar la información', '', {
        timeOut: 5000,
      });      

      this.spinner.hide();
    }
    

  }

  //Actualiza el volumen segun el input
  updateVolume(data:any){
    let volumeBasis = this.formFirstStep.controls['id_volume_basis'].value;

    //Es Daily, lo que tiene que hacer es que el volumen escrito en daily, se multiple por los días del mes de ese mes.
    if(volumeBasis === 1){

      let monthly:number = (data.vol_daily * data.days); 
      this.dataTable[data.position].vol_monthly = Math.trunc(monthly);

    } 
    //Es Monthly, 
    else if(volumeBasis === 2){
      let daily:number = (data.vol_monthly / data.days);
      this.dataTable[data.position].vol_daily = Math.trunc(daily);
    }
    else {
      //No hacer nada.
      let monthly:number = data.vol_daily; 
      let daily:number = data.vol_monthly;

      this.dataTable[data.position].vol_daily = Math.trunc(daily);
      this.dataTable[data.position].vol_monthly = Math.trunc(monthly);
    }

  }
  // BACK BUTTON
  goToTrades(): void {
    this.router.navigate(['/home/trade'], {
      state: {
        fechaInicio: this.fechaInicio.toISOString(),
        fechaFin: this.fechaFin.toISOString(),
      },
    });
  }  
      

  //BUTTON NEXT
  nextTable(){    
    this.spinner.show();

    if(this.formFirstStep.valid){
      //Pasar los inputs al objeto tradeInterface
      this.trade_object.trade_date = this.formFirstStep.controls['trade_date'].value;
      this.trade_object.id_trade_type = this.formFirstStep.controls['id_trade_type'].value;
      this.trade_object.id_bank = this.formFirstStep.controls['id_bank'].value;
      this.trade_object.id_trade = this.formFirstStep.controls['id_trade'].value;
      this.trade_object.id_sar = this.formFirstStep.controls['id_sar'].value;
      this.trade_object.period_start = this.formFirstStep.controls['fechaInicio'].value;
      this.trade_object.period_end = this.formFirstStep.controls['fechaFin'].value;
      this.trade_object.id_instrument = this.formFirstStep.controls['id_instrument'].value;
      this.trade_object.id_hedge_type = this.formFirstStep.controls['id_hedge_type'].value;
      this.trade_object.id_index = this.formFirstStep.controls['id_index'].value;
      this.trade_object.id_volume_basis = this.formFirstStep.controls['id_volume_basis'].value;
      this.trade_object.id_unit = this.formFirstStep.controls['id_unit'].value;
      this.trade_object.id_currency = this.formFirstStep.controls['id_currency'].value;
      this.trade_object.id_operation = this.formFirstStep.controls['id_operation'].value;
  
      this.trade_object.list_trades_period = this.dataTable;

      //Sumar los volumes 
      let sumDaily:number = 0;
      let sumMonthly:number = 0;
      for(var x = 0; x < this.trade_object.list_trades_period.length; x++){
        sumDaily += this.trade_object.list_trades_period[x].vol_daily;
        sumMonthly += this.trade_object.list_trades_period[x].vol_monthly;
      }

      this.trade_object.suma_total_daily = sumDaily;
      this.trade_object.suma_total_monthly = sumMonthly;

      //Revisar si tiene plantas
      let valueTemp = this.wsTrade.getValuesPlants();
      this.trade_object.list_trades_plants = valueTemp.dataPlants;
      this.trade_object.no_plants = valueTemp.no_plants;
      this.trade_object.plants = valueTemp.plants;
      
      //Enviar objeto al service
      this.wsTrade.setValuesTrade(this.trade_object);
  
      console.log(this.trade_object);
      
      this.spinner.hide();
      //Siguiente ventana
      if(this.modoView === 'Edit'){
        this.router.navigate(['/home/trade/step-2', this.trade_id]);
      }
      else {
        this.router.navigateByUrl('home/trade/step-2');
      }
    }
    else {
      this.toastr.error('Favor de completar la información', '', {
        timeOut: 5000,
      });  
      this.spinner.hide();
    }

  }
  

  fillDownPrice(data:any){
    if(this.dataTable.length > 0 && data.position == 0 && this.fill_down_price){      
      let price = data.price;
      for(var x = 0; x < this.dataTable.length; x++){            
        this.dataTable[x].price = price;                  
      }                        
    }
  }
  


  fillDown(data:any, letter:string){
    //Revisar si es daily o monthly. 
    let volumeBasis = this.formFirstStep.controls['id_volume_basis'].value;
    if(this.dataTable.length > 0 && data.position == 0 && this.fill_down){      
      //Es Daily, lo que tiene que hacer es que el volumen escrito en daily, se multiple por los días del mes de ese mes.
      if(volumeBasis === 1 && letter == 'D'){
        let vol_daily = data.vol_daily;               
        for(var x = 0; x < this.dataTable.length; x++){
          this.dataTable[x].vol_daily = Math.trunc(vol_daily);
          //Actualizar volumenes de monthly
          this.updateVolume(this.dataTable[x]);
        }    
      } 

      //Es Monthly, 
      if(volumeBasis === 2 && letter == 'M'){
        let vol_monthly = data.vol_monthly;
        for(var x = 0; x < this.dataTable.length; x++){
          this.dataTable[x].vol_monthly = Math.trunc(vol_monthly);
          //Actualizar volumenes de monthly
          this.updateVolume(this.dataTable[x]);
        }   
      }
    }
  }

  populateFormAndTable(data: any): void {
    // Populate the form fields
    this.formFirstStep.patchValue({
      trade_date: data.trade_date ? new Date(data.trade_date) : null,
      id_trade_type: data.id_trade_type || null,
      id_bank: data.id_bank || null,
      id_trade: data.id_trade || null,
      id_sar: data.id_sar || null,
      fechaInicio: data.period_start || data.fechaInicio ? new Date(data.period_start || data.fechaInicio) : null,
      fechaFin: data.period_end || data.fechaFin ? new Date(data.period_end || data.fechaFin) : null,
      id_instrument: data.id_instrument || null,
      id_hedge_type: data.id_hedge_type || null,
      id_index: data.id_index || null,
      id_volume_basis: data.id_volume_basis || null,
      id_unit: data.id_unit || null,
      id_currency: data.id_currency || null,
      id_operation: data.id_operation || null,
    });
  
    // Use periodsAux for the dataTable
    this.dataTable = this.periodsAux || [];
    this.dataSource.data = this.dataTable;
    }  



}

