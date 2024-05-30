// banks.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { SarsInterface } from '../interfaces/sars.interface';
import { environment } from '../../../../environments/environment';
import { catchError, map } from 'rxjs/operators';



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

  addSars(bankData: SarsInterface): Observable<any> {
    return this.http.post(`${this.urlBackLocal}admin/sars/add`, bankData, { responseType: 'text' })
        .pipe(
            map(response => JSON.parse(response)),
            catchError(error => {
                console.error('Error adding bank:', error);
                return throwError(() => new Error('Failed to add sar'));
            })
        );
  }

  updateSar(bank: SarsInterface): Observable<any> {
    return this.http.put(`${this.urlBackLocal}admin/sars/update/${bank.id_sar}`, this.sars);
  }

  



}
