import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';


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
        path:'trade',
        loadChildren: () => import('./trades/modules/trade.module').then ( m => m.TradeModule )
      },
      {
        path: 'administracion',
        children: [
          { 
            path: 'administracion/banks',
            loadChildren: () => import('./admin/banks/banks.module').then(m => m.BanksModule) 
          },
          {
            path: 'administracion/clients',
            loadChildren: () => import('./admin/clients/clients.module').then(m => m.ClientsModule)
          },
          {
            path: 'administracion/plants',
            loadChildren: () => import('./admin/plants/plants.module').then(m => m.PlantsModule)
          },
          {
            path: 'administracion/sars', 
            loadChildren: () => import('./admin/sars/sars.module').then(m => m.SarsModule)
          },
        ]
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
