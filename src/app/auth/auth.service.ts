import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Usuario } from './interfaces/usuario.interface';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private urlBaseAlliaxPruebas:string = "https://alxtest.alfabw.alface.com.mx/EformsApi/login";
  private urlBaseAlliaxProductivo:string = "https://alxoutportal01.alfabw.alface.com.mx/EformsApi/login";
  private urlBase:string = environment.urlBackLocal;

  constructor(private http:HttpClient) { }

  iniciarSesionAlliax():Observable<any>{
    const formData = new FormData();
    formData.append("usuario", "eformsNeg");
    // formData.append("password", "AlliaxPruebas$2023"); //pruebas
    formData.append("password", "EfAlxNatural$2023"); //productivo
    return this.http.post<any>(this.urlBaseAlliaxProductivo, formData);    
  }

  iniciarSesion(user: Usuario): Observable<any> {
    var params = {
      user: user.email_usuario,
      password: user.password_usuario
    };
  
    return this.http.post<any>(this.urlBase + 'Auth/Autenticar', params).pipe(
      tap(response => {
  
        if (response.token && response.token.token) { 
          localStorage.setItem('authToken', response.token.token);
          localStorage.setItem('permisoUsuario', response.token.data.permiso_usuario.toString()); 

          const permissions = {
            newTrade: response.token.data.permiso_new_trade,
            uploadFile: response.token.data.permiso_upload_file,
            settled: response.token.data.permiso_settled,
            editTrade: response.token.data.permiso_edit_trade,
            actionColumn: response.token.data.permiso_action_column,
            catalogs: response.token.data.permiso_catalogs
          };
      
          localStorage.setItem('userPermissions', JSON.stringify(permissions));
        }
      })
    );
  }
  

  getPermisoUsuario(): number {
    return Number(localStorage.getItem('permisoUsuario')) || 0;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('permisoUsuario');
  }
  
  
}
