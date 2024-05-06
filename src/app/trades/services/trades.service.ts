import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListPlants, TradeInterface } from '../interfaces/trade.interface';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})

export class TradesService {

  private urlBackLocal = environment.urlBackLocal;      
  private trade:TradeInterface = {} as TradeInterface; 

  public headers = new HttpHeaders({
    //'Authorization' : 'Bearer ' + sessionStorage.getItem('accessToken'),
    'Content-Type': 'application/json; charset=utf-8', 
    'Accept': 'application/json, text/javascript, /;' ,                                   
    //'Apikey': 'r4jH5dvwByvLae4J5wDAA6FLSR6twV',    
    //'Authorization' : 'r4jH5dvwByvLae4J5wDAA6FLSR6twV',    
  });


  constructor(private http:HttpClient, private auth:AuthService) { 

  }  

  setValuesTrade(data:TradeInterface){
    this.trade = data;
  }

  setValuesPlants(data:ListPlants[]){
    this.trade.list_trades_plants = data;
  }


  getValuesTrade(){
    return this.trade;
  }

  getValuesPlants(){
    return {
      dataPlants:this.trade.list_trades_plants,
      no_plants:this.trade.no_plants,
      plants:this.trade.plants
    }        
  }

  createTrade(data:any):Observable<any>{   
    let link = this.urlBackLocal + 'Trade/NewTrade';
    let params = data;
    return this.http.post<any>(link, params, {headers:this.headers });
  }

  updateTrade(data:any):Observable<any>{   
    let link = this.urlBackLocal + 'Trade/UpdateTrade';
    let params = data;
    return this.http.post<any>(link, params, {headers:this.headers });
  }

  getTrades(fecha1:Date, fecha2:Date):Observable<any>{   
    let params = {
      fecha1:fecha1,
      fecha2: fecha2
    }
    return this.http.post<any>(this.urlBackLocal + 'Trade/GetHistoryTrades', params, {headers:this.headers});        
  }

  getTradeWithId(id_trade:string):Observable<any>{
    let trade = {
      id_trade: id_trade
    }
    return this.http.post<any>(this.urlBackLocal + 'Trade/GetTradeWithId', trade, {headers:this.headers});        
  }

  updateSettledStatus(array:any):Observable<any>{
    let params = array;
    return this.http.post<any>(this.urlBackLocal + 'Trade/SettleTrades', params, {headers:this.headers});        
  }

  
  getListTradeTypes():Observable<any>{   
    return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListTradeType');        
  }

  getListBanks():Observable<any>{   
    return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListBanks');        
  }

  getListCurrency():Observable<any>{   
    return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListCurrency');        
  }

  getListHedgeTypes():Observable<any>{   
    return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListHedgeTypes');        
  }

  getListIndexTypes():Observable<any>{   
    return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListIndexTypes');        
  }

  getListInstruments():Observable<any>{   
    return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListInstruments');        
  }

  getListOperationTypes():Observable<any>{   
    return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListOperationTypes');        
  }

  getListSars():Observable<any>{   
    return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListSars');        
  }

  getListVolumeBasis():Observable<any>{   
    return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListVolumeBasis');        
  }

  getListVolumeUnits():Observable<any>{   
    return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListVolumeUnits');        
  }

  getClients():Observable<any>{   
    return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListClients');        
  }


}
