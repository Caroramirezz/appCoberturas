import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UserPermissions {
  newTrade: boolean;
  uploadFile: boolean;
  settled: boolean;
  editTrade: boolean;
  actionColumn: boolean;
  catalogs: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  permissions: UserPermissions;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}
  private urlBackLocal = environment.urlBackLocal;


  getUsers(): Observable<User[]> {
    let link = this.urlBackLocal + 'User/permissions';
    return this.http.get<User[]>(link);
  }

  updateUserPermissions(user: User): Observable<void> {
    const link = `${this.urlBackLocal}User/permissions/${user.id}`;
    return this.http.put<void>(link, {
      permiso_new_trade: user.permissions.newTrade,
      permiso_upload_file: user.permissions.uploadFile,
      permiso_settled: user.permissions.settled,
      permiso_edit_trade: user.permissions.editTrade,
      permiso_action_column: user.permissions.actionColumn,
      permiso_catalogs: user.permissions.catalogs
    });
  }
}
