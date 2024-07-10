import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ListPlants, SaveTrade, TradeInterface } from 'src/app/trades/interfaces/trade.interface';
import { TradesService } from 'src/app/trades/services/trades.service';

@Component({
  selector: 'app-second-step',
  templateUrl: './second-step.component.html',
  styleUrls: ['./second-step.component.scss']
})
export class SecondStepComponent implements OnInit {

  trade_id:string='';
  modoView:string='New';

  trade_object:TradeInterface = {} as TradeInterface; 
  saveTrade:SaveTrade[] = [];

  no_plants:any;  
  plants_choose:any[] = [];  
  plants_chooseEdit:any[] = [];  
  ids_neg:any[] = [];
  filldown_daily:boolean = false;

  dataPlants:any[] = [];
  dataPlantsEdit:any[] = [];
  listPlants:any[] = [];

  fill_down:boolean = false;  
  fill_down_price:boolean = false;

  constructor(
    private router:Router, 
    private route:ActivatedRoute,
    private wsTrade:TradesService,
    private spinner: NgxSpinnerService,    
    private toastr: ToastrService,  
  ) { 

  }

  ngOnInit(): void {
    this.getListPlants();    
     //Jalar ID de la URL
    this.route.params.subscribe(params => {
      if(params['id']){
        this.trade_id = params['id']; // Access the 'id' parameter from the URL
        this.modoView = 'Edit';      
      }
    });

    if(this.modoView == 'New'){
      let dataService:TradeInterface = this.wsTrade.getValuesTrade();
      if(Object.keys(dataService).length > 0){
        // if(dataService.list_trades_plants!.length > 0){
          this.trade_object = dataService;
          this.mapearInfo();
        //}      
      }
    }
    //Es modo Edición.
    else {
      //Consultar la información.
      this.GetTradeWithId();

      let dataService:TradeInterface = this.wsTrade.getValuesTrade();
      if(Object.keys(dataService).length > 0){
        //if(dataService.list_trades_plants!.length > 0){
          this.trade_object = dataService;
          this.dataPlants = this.trade_object.list_trades_plants;
        //}
      }
      console.log(dataService);
    }
 
  }


  GetTradeWithId(){    
    let aux:any[] = [];
    let auxClientes:any[] = [];
    let auxNEGID:any[] = [];
    let clientes:any[] = [];
    let idNEG:any[] = [];

    this.spinner.show();
    
    this.wsTrade.getTradeWithId(this.trade_id).subscribe(result => {                
      for(var x = 0; x < result.data.length; x++){              
        
        //Plantas
        if(result.data[x].id_neg != ''){
          aux.push(result.data[x]);           
          
          //Mapear clientes        
          auxClientes.push(result.data[x].id_plant);
          auxNEGID.push(result.data[x].id_neg);
        }       
        //Quitar repetidos
        clientes = auxClientes.filter((item,index)=>{
          return auxClientes.indexOf(item) === index;
        });

        idNEG = auxNEGID.filter((item,index)=>{
          return auxNEGID.indexOf(item) === index;
        });

      }
                        
      //Mapear al select de las plantas. 
      let aux2 = 0;
      let auxClientes2 = 0;
      let primeraVez = true;
      
      for(var z = 0; z < this.listPlants.length; z++){
        if(primeraVez){
          aux2 = clientes[auxClientes2];
          primeraVez = false;
        }
  
        if(aux2 == this.listPlants[z].id_plant){
          this.plants_chooseEdit.splice(auxClientes2, 0, this.listPlants[z]);
          primeraVez = true;
          auxClientes2++;          
        }
      }        
      
      this.ids_neg = idNEG;
      this.dataPlantsEdit = aux;
      this.plants_choose = this.plants_chooseEdit;
      this.no_plants = clientes.length;    
      
      //Crear Objeto.
      let flag = true;
      let auxID = 0;
      this. dataPlants = [];

      for(var y = 0; y < this.plants_chooseEdit.length; y++){

        if(flag){
          auxID = this.plants_chooseEdit[y].id_plant;
          flag = false;
        }

        if(auxID == this.plants_chooseEdit[y].id_plant){
          //Se crea el cliente. 
          if(Object.keys(this.trade_object).length > 0){ 
            this.dataPlants.push({
              position:y,
              id_plant: this.plants_choose[y].id_plant,
              name_client: this.plants_choose[y].client,
              name_plant: this.plants_choose[y].name_plant,
              neg_id:this.ids_neg[y],
              id_trade:this.trade_object.id_trade,  
              fill_down:false,
              fill_down_price:false,
              table:[]
            });           

            for(var o = 0; o < this.trade_object.list_trades_period!.length; o++){
              this.dataPlants[y].table.push(
                {                                                
                  position:this.trade_object.list_trades_period![o].position,
                  date: this.trade_object.list_trades_period![o].date,
                  vol_daily:0,              
                  vol_monthly:0,
                  price:0,
                  month:this.trade_object.list_trades_period![o].month,
                  days:this.trade_object.list_trades_period![o].days              
                }
              );             
            }                             
          }                   
        }
        flag = true;      
      }

      //Agregar valores restantes
      for(var x = 0; x < this.dataPlants.length; x++){                
        for(var y = 0; y < this.dataPlantsEdit.length; y++){          
          if(this.dataPlants[x].id_plant == this.dataPlantsEdit[y].id_plant){
            for(var e = 0; e < this.dataPlants[x].table.length; e++){
              if(this.dataPlants[x].table[e].month == moment(this.dataPlantsEdit[y].trade_month).get('month')){
                this.dataPlants[x].table[e].vol_daily = this.dataPlantsEdit[y].vol_daily;
                this.dataPlants[x].table[e].vol_monthly = this.dataPlantsEdit[y].vol_monthly;
                this.dataPlants[x].table[e].price = this.dataPlantsEdit[y].price;
              }              
            }                         
          }               
        }                                                       
       
      }              
      
      this.trade_object.list_trades_plants = this.dataPlants;

      this.spinner.hide();
    }, error => {      
      this.spinner.hide();
      this.toastr.error(error, '', {
        timeOut: 5000,
      });   

    })
  }

  getListPlants(){
    this.wsTrade.getPlants().subscribe(result => {
      this.listPlants = result.data;
    }, error => {
      console.log(error);
    })
  }

  getListClients(){
    this.wsTrade.getClients().subscribe(result => {
      this.listPlants = result.data;
    }, error => {
      console.log(error);
    })
  }
  
  mapearInfo(){

    if(this.modoView == 'New'){
      this.no_plants = this.trade_object.no_plants;
      this.plants_choose = this.trade_object.plants;
      this.dataPlants = this.trade_object.list_trades_plants;
    }
    else {
      this.no_plants = this.trade_object.no_plants;
      this.plants_choose = this.trade_object.plants;
      this.dataPlants = this.trade_object.list_trades_plants;      
    }
  }

  createPlants(){    

    //Si trae valor del first-step
    if(Object.keys(this.trade_object).length > 0){
      if(this.no_plants == this.plants_choose.length){            
        
        this.trade_object.no_plants = parseInt(this.no_plants);
        this.trade_object.plants = this.plants_choose;

        if(this.modoView == 'Edit'){
          //Crear tabla
          if(this.trade_object.list_trades_plants.length > 0){

            let diferencia = this.trade_object.no_plants - this.trade_object.list_trades_plants.length;
            console.log(diferencia);

            for(var x = this.trade_object.list_trades_plants.length; x < this.plants_choose.length; x++){
              this.dataPlants.push({
                position:x,
                id_plant: this.plants_choose[x].id_plant,
                name_plant: this.plants_choose[x].name_plant,
                id_client:this.plants_choose[x].client_id,
                neg_id:0,
                id_trade:this.trade_object.id_trade,  
                fill_down:false,
                fill_down_price:false,
                table:[]
              });
              for(var y = 0; y < this.trade_object.list_trades_period!.length; y++){
                this.dataPlants[x].table.push(
                  {                                                
                    position:this.trade_object.list_trades_period![y].position,
                    date: this.trade_object.list_trades_period![y].date,
                    vol_daily:0,              
                    vol_monthly:0,
                    price:0,
                    month:this.trade_object.list_trades_period![y].month,
                    days:this.trade_object.list_trades_period![y].days              
                  }
                );
              }    
            }    
          }
         
        }
        else {      
          this.dataPlants = [];  
          //Crear tabla
          for(var x = 0; x < this.plants_choose.length; x++){
            this.dataPlants.push({
              position:x,             
              id_plant: this.plants_choose[x].id_plant,
              name_plant: this.plants_choose[x].name_plant,
              id_client:this.plants_choose[x].client_id,
              neg_id:0,
              id_trade:this.trade_object.id_trade,  
              fill_down:false,
              fill_down_price:false,
              table:[]
            });
            for(var y = 0; y < this.trade_object.list_trades_period!.length; y++){
              this.dataPlants[x].table.push(
                {                                                
                  position:this.trade_object.list_trades_period![y].position,
                  date: this.trade_object.list_trades_period![y].date,
                  vol_daily:0,              
                  vol_monthly:0,
                  price:0,
                  month:this.trade_object.list_trades_period![y].month,
                  days:this.trade_object.list_trades_period![y].days              
                }
              );
            }    
          }        
        }
      } 
      else { 
        this.toastr.error('Número de plantas y plantas seleccionadas no coincide.', '', {
          timeOut: 5000,
        });   
      }
    }  
    else {
      this.toastr.error('Error Sistema.', '', {
        timeOut: 5000,
      });      
    }    
  }


  updateVolume(data:any, basis:string, p:any){    
    
    //Es Daily, lo que tiene que hacer es que el volumen escrito en daily, se multiple por los días del mes de ese mes.
    if(basis === 'D'){

      let monthly:number = (data.vol_daily * data.days); 
      this.dataPlants[p.position].table[data.position].vol_monthly = Math.trunc(monthly);

    } 
    //Es Monthly, 
    else if(basis === 'M'){
      let daily:number = (data.vol_monthly / data.days);
      this.dataPlants[p.position].table[data.position].vol_daily = Math.trunc(daily);
    }
    else {
      //No hacer nada.
    }

  }

  fillDownPrice(data:any, p:any){
    if(this.dataPlants.length > 0 && this.dataPlants[0].table.length > 0 && data.position == 0 && p.fill_down_price){      
      let price = data.price;      
      for(var y = 0; y < p.table.length; y++){
        p.table[y].price = price;          
      }              
    }
  }
  


  fillDown(data:any, letter:string, p:any){
    //Revisar si es daily o monthly. 
    let volumeBasis = this.trade_object.id_volume_basis;    

    if(this.dataPlants.length > 0 && this.dataPlants[0].table.length > 0  && data.position == 0 && p.fill_down){      
      //Es Daily, lo que tiene que hacer es que el volumen escrito en daily, se multiple por los días del mes de ese mes.
      if(volumeBasis === 1 && letter == 'D'){
        let vol_daily = data.vol_daily;     
                
        for(var y = 0; y < p.table.length; y++){
          p.table[y].vol_daily = Math.trunc(vol_daily);
          //Actualizar volumenes de monthly
          this.updateVolume(p.table[y], 'D', p);                
        }      
      } 

      //Es Monthly, 
      if(volumeBasis === 2 && letter == 'M'){
        let vol_monthly = data.vol_monthly;

        for(var x = 0; x < this.dataPlants.length; x++){
          for(var y = 0; y < this.dataPlants[x].table.length; y++){
            this.dataPlants[x].table[y].vol_monthly = Math.trunc(vol_monthly); 
            //Actualizar volumenes de monthly
             this.updateVolume(this.dataPlants[x].table[y], 'M', p);
          }        
        }         
      }
    }
  }

  back(){

    if(this.modoView === 'Edit'){
      this.router.navigate(['/home/trade/step-1', this.trade_id]);
    }
    else {
      this.router.navigateByUrl('home/trade/step-1');
    }



  }

  save(){
    this.spinner.show();
    let client = 0;
    let date="";
    let sumaPorMes = 0;
    let objectTemp = [];    
    let objectService:ListPlants[] = [];
    let validation:boolean = false;

    while(client < this.dataPlants[0].table.length){      
      for(var x = 0; x < this.dataPlants.length; x++){
              
        sumaPorMes += this.dataPlants[x].table[client].vol_daily;            
        date = this.dataPlants[x].table[client].date;
      } 
      objectTemp.push({
        date: date,
        sumaPorMes:sumaPorMes
      });

      client++
      sumaPorMes = 0;
    }    


    //Validar que los volumenes diarios con los que cerraste el banco por mes sea igual a los volumenes diarios de las plantas por mes.
    for(var y = 0; y < objectTemp.length; y++){
      if(new Date(objectTemp[y].date) != new Date(this.trade_object.list_trades_period![y].date) && objectTemp[y].sumaPorMes != this.trade_object.list_trades_period![y].vol_daily){
        //No coinciden las fecha y sumas, por lo tanto, está mal el cuadre de los volumenes. 
        this.toastr.error('Error en los volúmenes, favor de revisar.', '', {
          timeOut: 5000,
        });         
        validation = false;
        this.spinner.hide();
        break;
      }
      else {
        validation = true;
      }      
    }

    if(validation){
      // this.toastr.success('Se ha guardado correctamente.', '', {
      //   timeOut: 5000,
      // });

      //Falta mapear al objeto y mandar al service.
      this.trade_object.no_plants = this.no_plants;
      
      for(var z = 0; z < this.dataPlants.length; z++){
        objectService.push({
          id_neg:this.dataPlants[z].id_neg,
          id_plant: this.dataPlants[z].id_plant,
          id_trade: this.dataPlants[z].id_trade,          
          name_plant: this.dataPlants[z].name_plant,
          fill_down:this.dataPlants[z].fill_down,
          fill_down_price:this.dataPlants[z].fill_down_price,
          table: this.dataPlants[z].table
        });       
      }            

      //Mapear objeto
      this.trade_object.list_trades_plants = objectService      
      // this.trade_object.no_plants = this.no_plants;
      // this.trade_object.plants = this.plants_choose;
      
      //Enviar objeto al service
      this.wsTrade.setValuesTrade(this.trade_object);
      this.wsTrade.setValuesPlants(this.trade_object.list_trades_plants);      
      
      //Despues, guardar en base de datos. 
      this.enviarBD();
      this.spinner.hide();
    }

  }

  enviarBD(){
    this.spinner.show();
    this.saveTrade = [];
    //Primero la parte del banco.
    for(var x = 0; x < this.trade_object.list_trades_period!.length; x++){
      this.saveTrade.push({
        id_trade:this.trade_object.id_trade,
        id_neg:"",
        settled:false,
        id_trade_type: this.trade_object.id_trade_type,
        bank_leg:true,
        counterparty:this.trade_object.id_bank,
        id_bank:this.trade_object.id_bank,        
        trade_date: new Date(this.trade_object.trade_date),
        id_sar: this.trade_object.id_sar,
        id_instrument: this.trade_object.id_instrument,
        id_hedge_type: this.trade_object.id_hedge_type,
        id_index: this.trade_object.id_index,
        id_volume_basis: this.trade_object.id_volume_basis,
        id_operation: this.trade_object.id_operation,
        id_currency: this.trade_object.id_currency,
        id_unit: this.trade_object.id_unit,
        trade_month:this.trade_object.list_trades_period![x].date,
        vol_daily: this.trade_object.list_trades_period![x].vol_daily,
        vol_monthly: this.trade_object.list_trades_period![x].vol_monthly,
        price: this.trade_object.list_trades_period![x].price
      });
    }

    //Despues la parte espejo (plantas)
    //Si la primer parte, fue compra, esta contraparte tiene que ser venta.
    let tradeTypeStep2 = 0;
    if(this.trade_object.id_trade_type == 1){
      tradeTypeStep2 = 2;
    }
    else if(this.trade_object.id_trade_type == 2){
      tradeTypeStep2 = 1;
    }

    for(var x = 0; x < this.trade_object.list_trades_plants.length; x++){
      for(var y = 0; y < this.trade_object.list_trades_plants[x].table.length; y++){            
        this.saveTrade.push({
          id_trade:this.trade_object.id_trade,
          id_neg: this.trade_object.id_trade + "-NEG-" + (x + 1), //si es update, hay que partir del ultimo registro
          settled:false,
          id_trade_type: this.trade_object.id_trade_type,
          bank_leg:false,
          counterparty:this.trade_object.list_trades_plants[x].id_plant,
          id_plant:this.trade_object.list_trades_plants[x].id_plant,
          id_bank:undefined,
          trade_date: new Date(this.trade_object.trade_date),
          id_sar: this.trade_object.id_sar,
          id_instrument: this.trade_object.id_instrument,
          id_hedge_type: this.trade_object.id_hedge_type,
          id_index: this.trade_object.id_index,
          id_volume_basis: this.trade_object.id_volume_basis,
          id_operation: tradeTypeStep2,
          id_currency: this.trade_object.id_currency,
          id_unit: this.trade_object.id_unit,

          trade_month:this.trade_object.list_trades_plants[x].table[y].date ,
          vol_daily: this.trade_object.list_trades_plants[x].table[y].vol_daily,
          vol_monthly: this.trade_object.list_trades_plants[x].table[y].vol_monthly,
          price: this.trade_object.list_trades_plants[x].table[y].price
        });
      }    
    }        

    //Enviar al WS 
    if(this.modoView == 'Edit'){
      this.wsTrade.updateTrade(this.saveTrade).subscribe(result => {
        console.log(result);
        this.toastr.success('Actualizado satisfactoriamente!', '', {
          timeOut: 5000,        
        });  
        this.spinner.hide();

        //Temporizador para esperar unos segundos en la pantalla y luego cambiar ruta. 
        const timeoutId = setTimeout(() =>{
          this.router.navigateByUrl('home/trade/')
        }, 3000);
      
      }, error => {
        this.toastr.error('Error WS', '', {
          timeOut: 5000,
        });  
        this.spinner.hide();
      })
    }
    // NUEVO
    else {
      this.wsTrade.createTrade(this.saveTrade).subscribe(result => {
        console.log(result);
        this.toastr.success('Creado satisfactoriamente!', '', {
          timeOut: 5000,        
        });  
        this.spinner.hide();
      }, error => {
        this.toastr.error('Error WS', '', {
          timeOut: 5000,
        });  
        this.spinner.hide();
      })
    }
    
  }

}
