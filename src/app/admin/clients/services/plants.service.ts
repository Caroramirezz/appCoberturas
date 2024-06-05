import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PlantsInterface } from '../interfaces/plants.interface';

@Injectable({
  providedIn: 'root'
})

export class PlantsService {

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
 
  getPlantsByClientId(clientId: number): Observable<PlantsInterface[]> {
    return this.http.get<PlantsInterface[]>(`${this.urlBackLocal}Admin/plants/consulta?clientId=${clientId}`);
  }

  deletePlant(id: number): Observable<any> {
    return this.http.delete(`${this.urlBackLocal}admin/plants/${id}`);
  }

  updatePlant(plant: PlantsInterface): Observable<any> {
    return this.http.put(`${this.urlBackLocal}admin/plants/update/${plant.id_plant}`, plant);
  }

  addPlant(plant: PlantsInterface): Observable<any> {
    return this.http.post(`${this.urlBackLocal}admin/plants/add`, plant);
  }

}
