import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { BanksComponent } from './banks/banks.component';
import { ClientsComponent } from './clients/clients.component';
import { SarsComponent } from './sars/sars.component';
import { PlantsComponent } from './plants/plants.component';

@NgModule({
  declarations: [
    BanksComponent,
    ClientsComponent,
    SarsComponent,
    PlantsComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
