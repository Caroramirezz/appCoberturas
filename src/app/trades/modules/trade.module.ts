import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxSpinnerModule } from 'ngx-spinner';

import { MaterialModule } from 'src/app/material/material.module';
import { TradeRoutingModule } from './trade-routing.module';

import { ConsultaTradeComponent } from '../pages/consulta-trade/consulta.component';
import { DetalleComponent } from '../pages/detalle/detalle.component';
import { FirstStepComponent } from '../pages/new-trade/first-step/first-step.component';
import { SecondStepComponent } from '../pages/new-trade/second-step/second-step.component';


@NgModule({
  declarations: [
    ConsultaTradeComponent,
    DetalleComponent,
    FirstStepComponent,
    SecondStepComponent
  ],
  imports: [
    CommonModule,
    TradeRoutingModule,
    MaterialModule,
    FlexLayoutModule,
    NgxSpinnerModule,    
  ]
})
export class TradeModule { }
