import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { BloombergRecord } from './bloomberg.interface';
import axios from 'axios';
import * as qs from 'qs';
import * as Papa from 'papaparse';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BloombergService {
  private oauth2Endpoint: string = 'https://bsso.blpprofessional.com/ext/api/as/token.oauth2';
  private credentials = environment.bloombergCredentials;
  private token: string = '';
  private apiPrefix = environment.apiPrefix;
  private urlBackLocal = environment.urlBackLocal;
  

  constructor(private http: HttpClient) {}


  async getToken(): Promise<string> {
    const url = `${this.urlBackLocal}Bloomberg/getToken`;

    try {
      const response: any = await this.http.get(url).toPromise();
      if (response && response.access_token) {
        console.log("Token obtained:", response.access_token);
        return response.access_token;
      } else {
        throw new Error("Token response invalid");
      }
    } catch (error) {
      console.error("Error obtaining Bloomberg token:", error);
      throw error;
    }
}

  
 /* async getToken() {
    const tokenUrl = this.oauth2Endpoint;
    const client_id = this.credentials.client_id;
    const client_secret = this.credentials.client_secret;
    const url = `${this.urlBackLocal}Bloomberg/`;

    try {
      const tokenResponse = await axios.post(tokenUrl, qs.stringify({
        grant_type: 'client_credentials',
        client_id,
        client_secret
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.token = tokenResponse.data.access_token;
      console.log('Token obtained:', this.token);
      return this.token;
    } catch (error) {
      console.error('Error obtaining token:', error);
      throw error;
    }
  }*/
  /* async createDataRequest() {
    if (!this.token) {
      await this.getToken();
    }

    const catalogId = '39321'; // Use the discovered catalog ID
    const requestName = 'AngularDataRequest';

    const requestPayload = {
      '@type': 'DataRequest',
      'name': requestName,
      'description': 'Some description',
      'universe': {
        '@type': 'Universe',
        'contains': [
          {
            '@type': 'Identifier',
            'identifierType': 'TICKER',
            'identifierValue': 'AAPL US Equity',
          },
          {
            '@type': 'Identifier',
            'identifierType': 'BB_GLOBAL',
            'identifierValue': 'BBG009S3NB30',  // GOOG US Equity
          },
          {
            '@type': 'Identifier',
            'identifierType': 'ISIN',
            'identifierValue': 'US88160R1014',  // TSLA US Equity
          },
        ]
      },
      'fieldList': {
        '@type': 'DataFieldList',
        'contains': [
          { 'mnemonic': 'NAME' },
          { 'mnemonic': 'SECURITY_TYP' },
          { 'mnemonic': 'COUNTRY' },
        ],
      },
      'trigger': {
        '@type': 'SubmitTrigger',
      },
      'formatting': {
        '@type': 'MediaType',
        'outputMediaType': 'application/json',
      },
    };

    const url = `${this.host}/eap/catalogs/${catalogId}/requests/`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`).set('api-version', '2');

    try {
      const response = await this.http.post<any>(url, requestPayload, { headers }).toPromise();
      console.log('Data request created:', response);
      return response.headers['Location'];
    } catch (error) {
      console.error('Error creating data request:', error);
      throw error;
    }
  } */

    getStoredBloombergRecords(startDate?: string, endDate?: string) {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
    
      return this.http.get<BloombergRecord[]>(`${this.urlBackLocal}Bloomberg/GetRecords`, { params });
    }
    

storeBloombergData(data: any[]): Observable<any> {
  // Map and validate each record
  const formattedData = data.map(item => {
    if (!item.DL_REQUEST_ID || !item.DL_REQUEST_NAME || !item.DL_SNAPSHOT_TZ || !item.IDENTIFIER) {
      console.warn("Missing required fields in the record:", item);
      return null;  // Return null if any required fields are missing
    }

    return {
      DLRequestId: item.DL_REQUEST_ID,
      DLRequestName: item.DL_REQUEST_NAME,
      DLSnapshotStartTime: item.DL_SNAPSHOT_START_TIME,
      DLSnapshotTz: item.DL_SNAPSHOT_TZ,
      Identifier: item.IDENTIFIER,
      RC: item.RC,
      PXSettle: item.PX_SETTLE,
      PXClose1D: item.PX_CLOSE_1D,
      PXClose1YR: item.PX_CLOSE_1YR,
      PXClose1M: item.PX_CLOSE_1M,
      LastTradeableDt: item.LAST_TRADEABLE_DT,
      PXLast: item.PX_LAST,
    };
  }).filter(item => item !== null);  // Remove invalid records

  if (formattedData.length === 0) {
    console.error('No valid data to send.');
    return of(null);  // Return an observable that emits null or an appropriate value
  }

  const url = `${this.urlBackLocal}Bloomberg/store`;
  
  console.log('Data being sent to backend:', formattedData);
  
  return this.http.post(url, { records: formattedData });
}

async getDistributionUrl(requestIdentifier: string, snapshotDate: string): Promise<any> {
  const url = `${this.urlBackLocal}Bloomberg/getCsv/${requestIdentifier}/${snapshotDate}`;
  console.log('Fetching Bloomberg CSV from backend:', url);

  try {
      const response = await this.http.get(url, { responseType: 'text' }).toPromise();
      console.log('CSV Response:', response);

      if (response.startsWith('<!DOCTYPE html>')) {
          throw new Error("Bloomberg API returned an error page instead of CSV.");
      }

      return Papa.parse(response, { header: true, dynamicTyping: true }).data;
  } catch (error) {
      console.error('Error fetching Bloomberg CSV:', error);
      throw error;
  }
}

    
}
    /*async getDistributionUrl(requestIdentifier: string, snapshotDate: string): Promise<any> {
      if (!this.token) {
        //await this.getToken();
       this.token = await this.getToken();
      }
      // 53000 - Desarrollo
      // 39321 - Producción
      const url = `https://api.bloomberg.com/eap/catalogs/39321/datasets/${requestIdentifier}/snapshots/${snapshotDate}/distributions/${requestIdentifier}.csv`;
      console.log('Distribution URL:', url);
      
      try {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${this.token}`,
          'api-version': '2',
        });
  
        const response = await this.http.get(url, { headers, responseType: 'text' }).toPromise();
        console.log('Distribution content received:', response);
  
        // Parsing the CSV content
        const parsedData = Papa.parse(response, {
          header: true,
          dynamicTyping: true
        });
        return parsedData.data;
      } catch (error) {
        console.error('Error getting distribution content:', error);
        throw error;
      }
    }
  }
  


  
  

    // Prueba para verificar la conectividad

  /*async testConnectivity() {
    if (!this.token) {
      await this.getToken();
    }

    const url = '/api/eap/catalogs/';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`).set('api-version', '2');

    try {
      const response = await this.http.get<any>(url, { headers }).toPromise();
      console.log('Connectivity test response:', response);
      return response;
    } catch (error) {
      console.error('Error in connectivity test:', error);
      throw error;
    }
  }*/