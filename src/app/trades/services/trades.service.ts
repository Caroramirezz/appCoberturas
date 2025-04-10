import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListPlants, TradeInterface } from '../interfaces/trade.interface';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';
import { PlattsService } from 'src/app/platts/platts.service';
import { BloombergService } from 'src/app/bloomberg/bloomberg.service';
import { BloombergRecord } from '../interfaces/trade.interface';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TradesService {

  private urlBackLocal = environment.urlBackLocal;      
  private trade:TradeInterface = {} as TradeInterface; 
  private tradesDataSubject = new BehaviorSubject<any[]>([]);
  private dateRangeSubject = new BehaviorSubject<{ fechaInicio: Date; fechaFin: Date }>({
    fechaInicio: new Date(),
    fechaFin: new Date(),
  });

  tradesData$ = this.tradesDataSubject.asObservable();
  dateRange$ = this.dateRangeSubject.asObservable();

  public headers = new HttpHeaders({
    //'Authorization' : 'Bearer ' + sessionStorage.getItem('accessToken'),
    'Content-Type': 'application/json; charset=utf-8', 
    'Accept': 'application/json, text/javascript, /;' ,                                   
    //'Apikey': 'r4jH5dvwByvLae4J5wDAA6FLSR6twV',    
    //'Authorization' : 'r4jH5dvwByvLae4J5wDAA6FLSR6twV',    
  });


  constructor(
    private http:HttpClient, 
    private auth:AuthService,
    private plattsService: PlattsService,
    private bloombergService: BloombergService
  ) { 

    
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

  uploadTradeFile(data: FormData): Observable<any> {
    const url = this.urlBackLocal + "Trade/NewTrade";
    return this.http.post(url, data, {
      headers: { },  
      responseType: "text" as "json"
    });
  }
  
  
  updateTrade(data:any):Observable<any>{   
    let link = this.urlBackLocal + 'Trade/UpdateTrade';
    let params = data;
    return this.http.post<any>(link, params, {headers:this.headers });
  }

  getTrades(fecha1:String, fecha2:String):Observable<any>{   
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

  updateCalculatedTradeValues(updates: any[]): Observable<void> {
    return this.http.post<void>(`${this.urlBackLocal}Trade/update-calculated-trade-values`, updates);
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

  getVolumesAndPrices(tradeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlBackLocal}/${tradeId}/volumes`).pipe(
      map((response) => {
        return response.map((item: any) => ({
          date: new Date(item.date),
          vol_daily: Math.trunc(item.vol_daily || 0),
          vol_monthly: Math.trunc(item.vol_monthly || 0),
          price: item.price || 0,
          month: item.month || null,
          days: item.days || null,
        }));
      })
    );
  }

  getClients():Observable<any>{   
    return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListClients');        
  }

  getPlants():Observable<any>{   
    return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListPlants');        
  }

  getBloombergRecords(): Observable<BloombergRecord[]> {
    return this.http.get<BloombergRecord[]>(`${this.urlBackLocal}Bloomberg/GetBloombergRecords`);
  }

  updateTradeMarketPrice(idTrade: number, marketPrice: number): Observable<any> {
    return this.http.post<any>(`${this.urlBackLocal}Trade/updateMarketPrice`, { idTrade, marketPrice });
  }
  

}
