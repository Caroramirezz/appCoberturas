import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { BanksComponent } from './banks/consulta/banks.component';
import { ClientsComponent } from './clients/consulta/clients.component';
import { SarsComponent } from './sars/consulta/sars.component';
import { IndexesComponent } from './indexes/consulta/indexes.component';
import { PlantsComponent } from './plants/plants.component';
import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { AddBankComponent } from './banks/add/addBank.component';
import { AddSarComponent } from './sars/add/addSar.component';


@NgModule({
  declarations: [
    BanksComponent,
    ClientsComponent,
    SarsComponent,
    PlantsComponent,
    IndexesComponent,
    AddBankComponent,
    AddSarComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MaterialModule,
    FlexLayoutModule,
    NgxSpinnerModule,
    MatDialogModule,
  ]
})
export class AdminModule { }
