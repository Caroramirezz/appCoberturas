import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const permissionsJson = localStorage.getItem('userPermissions');
    const permissions = permissionsJson ? JSON.parse(permissionsJson) : {};
    const requiredPermission = route.data['requiredPermission'];
    const permisoUsuario = localStorage.getItem('permisoUsuario');

    if (requiredPermission) {
      if (!permissionsJson) {
        this.router.navigate(['/home/dashboard/usuario']);
        return false;
      }

      if (!permissions[requiredPermission]) {
        this.router.navigate(['/home/dashboard/usuario']);
        return false;
      }

      return true;
    }

    if (permisoUsuario === '1') {
      return true;
    }
        // ejemplo para prueba http://localhost:4200/#/home/admin/clients/consulta

    this.router.navigate(['/home/dashboard/usuario']);
    return false;
  }
}
