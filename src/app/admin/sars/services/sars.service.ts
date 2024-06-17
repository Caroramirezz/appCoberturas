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

  addSars(sarData: SarsInterface): Observable<any> {
    return this.http.post(`${this.urlBackLocal}admin/sars/add`, sarData, { responseType: 'text' })
        .pipe(
            map(response => JSON.parse(response)),
            catchError(error => {
                console.error('Error adding sar:', error);
                return throwError(() => new Error('Failed to add sar'));
            })
        );
  }

  updateSar(sar: SarsInterface): Observable<any> {
    return this.http.put(`${this.urlBackLocal}admin/sars/update/${sar.id_sar}`, sar)
      .pipe(
        catchError(error => {
          console.error('Error updating sar:', error);
          return throwError(() => new Error('Failed to update sar'));
        })
      );
  }
  

  



}
