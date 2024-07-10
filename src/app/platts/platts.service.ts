import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { DataItem } from './platts.interface';

@Injectable({
  providedIn: 'root'
})
export class PlattsService {
  private urlPlatts = "https://api.platts.com";
  private userPlatts = environment.userPlatts;
  private passPlatts = environment.passPlatts;

  private token: string = '';
  private tokenExpiration: Date | null = null;

  constructor(private http: HttpClient) { }

  private headersToken = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
    'appkey': environment.apiKey,
  });

  private headersRequest() {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.token,
      'Content-Type': 'application/x-www-form-urlencoded',
      'appkey': environment.apiKey,
    });
  }

  public getToken(): Observable<any> {
    const body = new URLSearchParams();
    body.set('username', this.userPlatts);
    body.set('password', this.passPlatts);

    return this.http.post<any>(this.urlPlatts + '/auth/api', body.toString(), { headers: this.headersToken })
      .pipe(
        map(response => {
          this.token = response.access_token;
          this.tokenExpiration = new Date(new Date().getTime() + 60 * 60 * 1000);
          return response;
        })
      );
  }

  private ensureTokenValid(): Observable<void> {
    if (!this.token || !this.tokenExpiration || new Date() > this.tokenExpiration) {
      return this.getToken().pipe(map(() => {}));
    } else {
      return from(Promise.resolve());
    }
  }

  public historyData(symbols: string[], bate: string, startDate: string, endDate: string): Observable<DataItem[]> {
    let filter = `symbol IN(${symbols.map(symbol => `"${symbol}"`).join(',')}) AND assessDate>"${startDate}" AND assessDate<"${endDate}"`;
    if (bate) {
      filter += ` AND bate="${bate}"`;
    }

    const params = new HttpParams().set('filter', filter);

    return this.ensureTokenValid().pipe(
      switchMap(() => this.http.get<any>(`${this.urlPlatts}/market-data/v3/value/history/symbol`, {
        params,
        headers: this.headersRequest()
      })),
      map(response => {
        const results: DataItem[] = [];
        response.results.forEach((symbolData: any) => {
          symbolData.data.forEach((dataItem: any) => {
            results.push({
              bate: dataItem.bate,
              value: dataItem.value,
              assessDate: dataItem.assessDate,
              symbol: symbolData.symbol,
              index: dataItem.index
            });
          });
        });
        return results;
      })
    );
  }
}
