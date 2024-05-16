// banks.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SarsInterface } from '../interfaces/sars.interface';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SarsService {

  private urlBackLocal = environment.urlBackLocal;      
  private sars:SarsInterface = {} as SarsInterface; 

  constructor(private http: HttpClient) {}

  getSars(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlBackLocal}admin/sars/consulta`);
  }

  deleteSars(id: number): Observable<any> {
    return this.http.delete(`${this.urlBackLocal}admin/sars/${id}`);
  }

  addSars(sarData: { number_sar: number }): Observable<any> {
    return this.http.post(`${this.urlBackLocal}admin/sars/add`, sarData);
  }
  



}
