import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ClientInterface } from '../interfaces/clients.interface';

@Injectable({
  providedIn: 'root'
})

export class ClientsService {

  private urlBackLocal = environment.urlBackLocal;      
  //private trade:TradeInterface = {} as TradeInterface; 

  public headers = new HttpHeaders({
    //'Authorization' : 'Bearer ' + sessionStorage.getItem('accessToken'),
    'Content-Type': 'application/json; charset=utf-8', 
    'Accept': 'application/json, text/javascript, /;' ,                                   
    //'Apikey': 'r4jH5dvwByvLae4J5wDAA6FLSR6twV',    
    //'Authorization' : 'r4jH5dvwByvLae4J5wDAA6FLSR6twV',    
  });


  constructor(private http:HttpClient) { 

  }  
 
  // getTrades(fecha1:Date, fecha2:Date):Observable<any>{   
  //   let params = {
  //     fecha1:fecha1,
  //     fecha2: fecha2
  //   }
  //   return this.http.post<any>(this.urlBackLocal + 'Trade/GetHistoryTrades', params, {headers:this.headers});        
  // }

  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlBackLocal}admin/clients/consulta`);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.urlBackLocal}admin/clients/${id}`);
  }

  updateClient(client: ClientInterface): Observable<any> {
    return this.http.put(`${this.urlBackLocal}admin/clients/update/${client.id_client}`, client);
  }

  addClient(client: Omit<ClientInterface, 'id_client'>): Observable<any> {
    return this.http.post(`${this.urlBackLocal}Admin/clients/add`, client);
  }
  
}
