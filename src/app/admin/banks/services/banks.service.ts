// banks.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BankInterface } from '../interfaces/banks.interface';
import { environment } from '../../../../environments/environment';
import { catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class BanksService {

  private urlBackLocal = environment.urlBackLocal;      
  private bank:BankInterface = {} as BankInterface; 

  constructor(private http: HttpClient) {}

  getBanks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlBackLocal}admin/banks/consulta`);
  }

  deleteBank(id: number): Observable<any> {
    return this.http.delete(`${this.urlBackLocal}admin/banks/${id}`);
  }

  addBank(bankData: BankInterface): Observable<any> {
    return this.http.post(`${this.urlBackLocal}admin/banks/add`, bankData, { responseType: 'text' })
        .pipe(
            map(response => JSON.parse(response)),
            catchError(error => {
                console.error('Error adding bank:', error);
                return throwError(() => new Error('Failed to add bank'));
            })
        );
  }

  updateBank(bank: BankInterface): Observable<any> {
    return this.http.put(`${this.urlBackLocal}admin/banks/update/${bank.id_bank}`, bank);
  }  

}
