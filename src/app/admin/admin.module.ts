import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { BanksComponent } from './banks/consulta/banks.component';
import { ClientsComponent } from './clients/consulta/clients.component';
import { SarsComponent } from './sars/consulta/sars.component';
import { IndexComponent } from './indexes/consulta/index.component';
import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { AddBankComponent } from './banks/add/addBank.component';
import { AddSarComponent } from './sars/add/addSar.component';
import { AddIndexComponent } from './indexes/add/addIndex.component';
import { EditBanksDialog } from './banks/edit/edit-banks.component';


@NgModule({
  declarations: [
    BanksComponent,
    ClientsComponent,
    SarsComponent,
    IndexComponent,
    AddBankComponent,
    AddSarComponent,
    EditBanksDialog,
    AddIndexComponent
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
