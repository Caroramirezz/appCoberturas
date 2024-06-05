import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PlattsService {

  private urlBackLocal = environment.urlBackLocal;      
  private urlPlatts = "https://api.platts.com";


  public headersToken = new HttpHeaders({
    //'Authorization' : 'Bearer ' + sessionStorage.getItem('access_token'),
    'Content-Type': 'application/x-www-form-urlencoded',
    //'Accept': 'application/json, text/javascript, /;' ,                                   
    'appkey': environment.apiKey,    
    //'Authorization' : 'r4jH5dvwByvLae4J5wDAA6FLSR6twV',    
  });

  
  public headersRequest = new HttpHeaders({
    'Authorization' : 'Bearer ' + sessionStorage.getItem('access_token'),
    'Content-Type': 'application/x-www-form-urlencoded',
    //'Accept': 'application/json, text/javascript, /;' ,                                   
    'appkey': environment.apiKey,       
  });

  constructor(private http:HttpClient) { 

  }  

  //Este se habilita al iniciar sesión. 
  getToken():Observable<any>{   
    const body = new URLSearchParams();
    
    
    body.set('username', 'eguel@alfa.com.mx');
    body.set('password', 'eGuel#1804');

    return this.http.post<any>(this.urlPlatts + '/auth/api', body.toString(), {headers:this.headersToken});        
  }

  //peticion con QueryParams; Hay que traer las variables si es necesario
  HistoryData(){  
    const params = new HttpParams() 
    .set('filter', 'symbol IN("IGBAP03","IGBAD03") AND (bate:"u") AND assessDate>"2020-02-01" AND assessDate<"2021-02-01"');
    //params.set('filter', 'symbol IN("IGBAP03","IGBAD03") AND (bate:"u") AND assessDate>"2020-02-01" AND assessDate<"2021-02-01"');
    console.log(params.toString())

    return this.http.get<any>(this.urlPlatts + '/market-data/v3/value/history/symbol', { params, headers:this.headersRequest } );    
  }


  // updateTrade(data:any):Observable<any>{   
  //   let link = this.urlBackLocal + 'Trade/UpdateTrade';
  //   let params = data;
  //   return this.http.post<any>(link, params, {headers:this.headers });
  // }


  // getTradeWithId(id_trade:string):Observable<any>{
  //   let trade = {
  //     id_trade: id_trade
  //   }
  //   return this.http.post<any>(this.urlBackLocal + 'Trade/GetTradeWithId', trade, {headers:this.headers});        
  // }

  // updateSettledStatus(array:any):Observable<any>{
  //   let params = array;
  //   return this.http.post<any>(this.urlBackLocal + 'Trade/SettleTrades', params, {headers:this.headers});        
  // }

  
  // getListTradeTypes():Observable<any>{   
  //   return this.http.get<any>(this.urlBackLocal + 'FiltrosTrade/ListTradeType');        
  // } 
  


}
