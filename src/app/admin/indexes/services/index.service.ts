import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { IndexInterface } from '../interfaces/indexes.interface';
import { environment } from '../../../../environments/environment';
import { catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class IndexService {

  private urlBackLocal = environment.urlBackLocal;      
  private index:IndexInterface = {} as IndexInterface; 

  constructor(private http: HttpClient) {}

  getIndexes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlBackLocal}admin/index/consulta`);
  }

  deleteIndex(id: number): Observable<any> {
    return this.http.delete(`${this.urlBackLocal}admin/index/${id}`);
  }

  addIndex(indexData: IndexInterface): Observable<any> {
    return this.http.post(`${this.urlBackLocal}admin/index/add`, indexData, { responseType: 'text' })
        .pipe(
            map(response => JSON.parse(response)),
            catchError(error => {
                console.error('Error adding index:', error);
                return throwError(() => new Error('Failed to add index'));
            })
        );
  }

  updateIndex(index: IndexInterface): Observable<any> {
    return this.http.put(`${this.urlBackLocal}admin/index/update/${index.id_index}`, index)
      .pipe(
        catchError(error => {
          console.error('Error updating index:', error);
          return throwError(() => new Error('Failed to update index'));
        })
      );
  }

}
