import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BanksComponent } from './banks/banks.component';
import { ClientsComponent } from './clients/consulta/clients.component';
import { PlantsComponent } from './plants/plants.component';
import { SarsComponent } from './sars/sars.component';

// const routes: Routes = [
//   { path: 'banks', loadChildren: () => import('./banks/banks.module').then(m => m.BanksModule) },
//   { path: 'clients', loadChildren: () => import('./clients/clients.module').then(m => m.ClientsModule) },
//   { path: 'plants', loadChildren: () => import('./plants/plants.module').then(m => m.PlantsModule) },
//   { path: 'sars', loadChildren: () => import('./sars/sars.module').then(m => m.SarsModule) }
// ];

const routes:Routes = [
  {
    path:'banks',
    children: [
      { path:'consulta', component:BanksComponent },    
      { path:'**', redirectTo: '' }
    ]
  },
  {
    path:'clients',
    children: [
      { path:'consulta', component:ClientsComponent },    
      { path:'**', redirectTo: '' }
    ]
  },
  {
    path:'plants',
    children: [
      { path:'consulta', component:PlantsComponent },    
      { path:'**', redirectTo: '' }
    ]
  },
  {
    path:'sars',
    children: [
      { path:'consulta', component:SarsComponent },    
      { path:'**', redirectTo: '' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
