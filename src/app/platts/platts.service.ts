import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PlattsService {
    
  private urlPlatts = "https://api.platts.com";
  private userPlatts = environment.userPlatts;
  private passPlatts = environment.passPlatts;


  public headersToken = new HttpHeaders({
    //'Authorization' : 'Bearer ' + sessionStorage.getItem('access_token'),
    'Content-Type': 'application/x-www-form-urlencoded',
    //'Accept': 'application/json, text/javascript, /;' ,                                   
    'appkey': environment.apiKey,    
    //'Authorization' : 'r4jH5dvwByvLae4J5wDAA6FLSR6twV',    
  });

  
  public headersRequest = new HttpHeaders({
    'Authorization' : 'Bearer ' + 'eyJraWQiOiJPLVlDdlpGSzlIekd3N3o5QjR5YTc2M3ViS1RjeU9mMW52clRRa0w4V0I0IiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULkUxWVdRY2RwODFtamhDRWNVWDltaHVNZ1BVNlRzQlNGY2xhb2dzeHJWNzQub2FycW83djh5QUc2Yzcxb3cxZDYiLCJpc3MiOiJodHRwczovL3NlY3VyZS5zaWduaW4uc3BnbG9iYWwuY29tL29hdXRoMi9zcGdsb2JhbCIsImF1ZCI6ImFwaTovL3NwZ2xvYmFsIiwiaWF0IjoxNzIwMTk3OTk2LCJleHAiOjE3MjAyMDE1OTYsImNpZCI6IlBMX0FQSV9QTEFURk9STSIsInVpZCI6IjAwdTFrdzF5eTFsZXh4MDNzMWQ4Iiwic2NwIjpbIm9mZmxpbmVfYWNjZXNzIiwib3BlbmlkIiwicHJvZmlsZSIsImFwaSJdLCJhdXRoX3RpbWUiOjE3MjAxOTc5OTYsInN1YiI6ImVndWVsQGFsZmEuY29tLm14IiwibGFzdE5hbWUiOiJCZW50ZWsgRlRQIiwiZGlzdHJpYnV0b3JQbGF0Zm9ybSI6IkFQSSIsImNvdW50cnkiOiIiLCJmaXJzdE5hbWUiOiJBbGZhIENvcnBvcmF0aXZvLCBTLiIsIkVtYWlsIjoiZWd1ZWxAYWxmYS5jb20ubXgiLCJHUk9VUFMiOlsiRXZlcnlvbmUiXSwiU1BfU1NPX0FQUFMiOlsiRVRBIiwiUExUU1VCUyIsIkRJTUVOU0lPTlMiLCJCRU5QT1JUIiwiUExBUEkiLCJTUEdQTEFUVFMiLCJNREQiLCJQTUMiXSwiY2xpZW50IjoiUExfQVBJX1BMQVRGT1JNIiwiY29tcGFueSI6W119.nVlqBzY1NkN3lsG0ZZKZE-tFocNXrt0erh0xYj-i4VSMy6N-UYJIVIHEOILhCeN4s1ZmfVvYCPqDoMT-dZjbWdrNCFICUokW1J8gjpUM7Wx7TV1r_ZYtvHWqzlc1-iKOxjjILosf2jbf1RCDwwczRGEqNMiyjm7AUWAmk2XpITCpwsHWQTVOnsILRkXt6LHw5ap1htsKWxM8WdnRz6ZwOchPJTswFmCYYYOA4sHuciz57Yt4y6_4cWT0JoBR0Gkth9qUjZ8c9huwolMxQ3KleIiIN--KcJ6RSXbSvNjiTQ8dmBD0VcwuVJKmfplJPZ8v9ps6cMlmeYlXn8VEh8o82A',
    'Content-Type': 'application/x-www-form-urlencoded',
    //'Accept': 'application/json, text/javascript, /;' ,                                   
    'appkey': environment.apiKey,       
  });

  constructor(private http:HttpClient) { 

  }  

  //Este se habilita al iniciar sesión. 
  getToken():Observable<any>{   
    const body = new URLSearchParams();
    body.set('username', this.userPlatts);
    body.set('password', this.passPlatts);

    return this.http.post<any>(this.urlPlatts + '/auth/api', body.toString(), {headers:this.headersToken});        
  }

  //peticion con QueryParams; Hay que traer las variables si es necesario
  HistoryData(){  
    const params = new HttpParams() 
    .set('filter', 'symbol IN("IGBAP03","IGBAD03") AND (bate:"u") AND assessDate>"2020-02-01" AND assessDate<"2021-02-01"');

    return this.http.get<any>(this.urlPlatts + '/market-data/v3/value/history/symbol', { params, headers:this.headersRequest } );
        

      }
  


}
