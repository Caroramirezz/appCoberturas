import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BanksComponent } from './banks/banks.component';
import { ClientsComponent } from './clients/clients.component';
import { PlantsComponent } from './plants/plants.component';
import { SarsComponent } from './sars/sars.component';

const routes: Routes = [
  { path: 'banks', loadChildren: () => import('./banks/banks.module').then(m => m.BanksModule) },
  { path: 'clients', loadChildren: () => import('./clients/clients.module').then(m => m.ClientsModule) },
  { path: 'plants', loadChildren: () => import('./plants/plants.module').then(m => m.PlantsModule) },
  { path: 'sars', loadChildren: () => import('./sars/sars.module').then(m => m.SarsModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
