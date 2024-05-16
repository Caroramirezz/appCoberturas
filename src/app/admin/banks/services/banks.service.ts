// banks.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankInterface } from '../interfaces/banks.interface';
import { environment } from '../../../../environments/environment';


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

  addBank(bankData: { bank: string; CSA: number }): Observable<any> {
    return this.http.post(`${this.urlBackLocal}/admin/banks/add`, bankData);
  }
  



}
