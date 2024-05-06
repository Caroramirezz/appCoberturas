import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardFinanzasComponent } from './pages/dashboard-finanzas/dashboard-finanzas.component';
import { DashboardUsuarioComponent } from './pages/dashboard-usuario/dashboard-usuario.component';
import { ChartsModule } from 'ng2-charts';

import * as echarts from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';



@NgModule({
  declarations: [
    DashboardFinanzasComponent,
    DashboardUsuarioComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MaterialModule,
    FlexLayoutModule,
    NgxSpinnerModule,      
    ChartsModule,
    NgxEchartsModule.forRoot({ echarts }),
  ], 
  exports: [
    DashboardFinanzasComponent
  ]
})
export class DashboardModule { }
