import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

    private urlPlatts = "https://api.platts.com";
    private userPlatts = environment.userPlatts;
    private passPlatts = environment.passPlatts;
    private urlBackLocal = environment.urlBackLocal;

    private token: string = '';
    private tokenExpiration: Date | null = null;

  constructor(private http: HttpClient) {}

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

  // Fetch the most recent date from the backend
  fetchMostRecentDate(): Observable<any> {
    return this.http.get(`${this.urlBackLocal}platts/latest-date`);  // Call your backend to fetch the latest assess_date
  }

  // Make API call to fetch Platts data from the last updated date to today
  fetchPlattsData(symbols: string[], bates: string[], startDate: string, endDate: string): Observable<any> {
    const filter = `symbol IN(${symbols.map(symbol => `"${symbol}"`).join(',')}) AND assessDate>"${startDate}" AND assessDate<"${endDate}" AND bate IN(${bates.map(bate => `"${bate}"`).join(',')})`;

    const params = new HttpParams().set('filter', filter);

    return this.ensureTokenValid().pipe(
      switchMap(() => this.http.get<any>(`${this.urlPlatts}/market-data/v3/value/history/symbol`, {
        params,
        headers: this.headersRequest()
      }))
    );
  }

  // Insert new data into the backend
  insertPlattsData(records: any[]): Observable<any> {
    return this.http.post<any>(`${this.urlBackLocal}platts/insert`, records);  // Call your backend to insert the fetched data
  }
}
