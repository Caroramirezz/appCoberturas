import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DashboardService {

  public headers = new HttpHeaders({
    //'Authorization' : 'Bearer ' + sessionStorage.getItem('accessToken'),
    'Content-Type': 'application/json; charset=utf-8', 
    'Accept': 'application/json, text/javascript, /;' ,                                   
    //'Apikey': 'r4jH5dvwByvLae4J5wDAA6FLSR6twV',    
    //'Authorization' : 'r4jH5dvwByvLae4J5wDAA6FLSR6twV',    
  });
  private urlBackLocal = environment.urlBackLocal;


  constructor(private http:HttpClient,) { 

  }  
  
  consultarSolicitudes(fechaInicio:Date, fechaFin:Date){        
    let link = this.urlBackLocal + 'SolicitudesPago/ConsultaSolicitudes';
    let params = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      flagVencimiento:0
    }   
    return this.http.post<any>(link, params, { headers: this.headers } );      
  }


  consultarSolicitudesPorMes(fechaInicio:Date, fechaFin:Date){        
    let link = this.urlBackLocal + 'Dashboard/SolicitudesPorMes';
    let params = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    }   
    return this.http.post<any>(link, params, { headers: this.headers } );      
  }

  consultarMontosPorMoneda(fechaInicio:Date, fechaFin:Date){        
    let link = this.urlBackLocal + 'Dashboard/SolicitudesTipoMoneda';
    let params = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    }   
    return this.http.post<any>(link, params, { headers: this.headers } );      
  }
}


