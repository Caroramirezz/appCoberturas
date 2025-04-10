import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlattsComponent } from './platts/platts.component';
import { BloombergComponent } from './bloomberg/bloomberg.component';
import { UserComponent } from './users/user.component';
import { PermissionGuard } from './auth/permission.guard';


const routes: Routes = [   
  {
    path:'auth',
    loadChildren: () => import('./auth/auth.module').then ( m => m.AuthModule )
  },
  {    
    path:'home',
    component:HomeComponent,   
    children:[      
      {
        path:'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then ( m => m.DashboardModule )
      },   
      {
        path:'platts',
        component:PlattsComponent
      },
      {
        path:'bloomberg',
        component:BloombergComponent
      },   
      {
        path:'trade',
        loadChildren: () => import('./trades/modules/trade.module').then ( m => m.TradeModule )
      },
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
        canActivate: [PermissionGuard],
        data: { requiredPermission: 'catalogs' }
      },
      {
        path:'permissions',
        component:UserComponent,
        canActivate: [PermissionGuard]
      },
    ] 
  }, 
  {    
    path:'**',
    //component:ErrorPageComponent
    redirectTo: 'auth/login'
  }  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
