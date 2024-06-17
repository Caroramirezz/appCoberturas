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
import { PlantDialogComponent } from './clients/plants/plant-dialog.component';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { MatSortModule } from '@angular/material/sort';
import { AddDialogComponent } from './add-dialog/add-dialog.component';




@NgModule({
  declarations: [
    BanksComponent,
    ClientsComponent,
    SarsComponent,
    IndexComponent,
    PlantDialogComponent,
    AddDialogComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MaterialModule,
    FlexLayoutModule,
    NgxSpinnerModule,
    MatDialogModule,
    FormsModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    RippleModule,
    DropdownModule,
    TagModule,
    DynamicDialogModule,
    ToastModule,
    MatSortModule,
  ],
  providers: [MessageService],
})
export class AdminModule { }
