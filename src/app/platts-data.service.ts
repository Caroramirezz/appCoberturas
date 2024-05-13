import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlattsDataService {

  private apiUrl = 'https://api.platts.com/market-data/v3/value/current/symbol?Field=UOM&Filter=symbol%20IN%20%28%22PCAAS00%22%2C%22IGBAP21%22%29%20AND%20%28bate%3A%22c%22%20OR%20bate%3A%22u%22%29%20AND%20modDate%3E%3D%222021-04-01T00%3A00%3A00%22&Sort=symbol%3Aasc&PageSize=1000&Page=1';

  constructor(private http: HttpClient) { }

  getMarketData(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.plattsApiToken}`
    });
    return this.http.get(this.apiUrl, { headers });
  }
}
