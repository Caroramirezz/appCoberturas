import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { WorstCaseInterface } from '../interfaces/worst-case.interface';
import { environment } from '../../../../environments/environment';
import { catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class WorstCaseService {

  private urlBackLocal = environment.urlBackLocal;      
  private wc:WorstCaseInterface = {} as WorstCaseInterface; 

  constructor(private http: HttpClient) {}

  getWC(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlBackLocal}Admin/worstcase/consulta`);
  }

  deleteWC(id: number): Observable<any> {
    return this.http.delete(`${this.urlBackLocal}admin/worstcase/${id}`);
  }

  addWC(wcData: WorstCaseInterface): Observable<any> {
    return this.http.post(`${this.urlBackLocal}admin/worstcase/add`, wcData, { responseType: 'text' })
        .pipe(
            map(response => JSON.parse(response)),
            catchError(error => {
                console.error('Error adding wc:', error);
                return throwError(() => new Error('Failed to add wc'));
            })
        );
  }

  updateWC(wc: WorstCaseInterface): Observable<any> {
    return this.http.put(`${this.urlBackLocal}admin/worstcase/update/${wc.id}`, wc)
      .pipe(
        catchError(error => {
          console.error('Error updating wc:', error);
          return throwError(() => new Error('Failed to update wc'));
        })
      );
  }

  getIndexNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.urlBackLocal}admin/index-types/names`);
  }
  
  InsertWC(changes: any[]): Observable<any> {
    return this.http.post(`${this.urlBackLocal}admin/worstcase/insert`, changes);
  }

  
}
