import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import axios from 'axios';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class BloombergService {
  private oauth2Endpoint: string = 'https://bsso.blpprofessional.com/ext/api/as/token.oauth2';
  private credentials = environment.bloombergCredentials;
  private token: string = '';
  private host: string = 'https://api.bloomberg.com';
  private apiPrefix: string = '/api';

  constructor(private http: HttpClient) {}

  async getToken() {
    const tokenUrl = this.oauth2Endpoint;
    const client_id = this.credentials.client_id;
    const client_secret = this.credentials.client_secret;

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
  }

  async getDistributionUrl(requestIdentifier: string, snapshotDate: string): Promise<any> {
    if (!this.token) {
      await this.getToken();
    }
    // 53000 - Desarrollo
    // 39321 - Producción
    const url = `${this.apiPrefix}/eap/catalogs/53000/datasets/${requestIdentifier}/snapshots/${snapshotDate}/distributions/${requestIdentifier}.json`;
    console.log('Distribution URL:', url);

    try {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.token}`,
        'api-version': '2'
      });
      const response = await this.http.get<any>(url, { headers }).toPromise();
      console.log('Distribution content received:', response);
      return response;
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