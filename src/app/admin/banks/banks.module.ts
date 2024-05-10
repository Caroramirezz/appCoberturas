import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BanksRoutingModule } from './banks-routing.module';
import { BanksComponent } from './banks.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MaterialModule } from 'src/app/material/material.module';



@NgModule({
  declarations: [
    BanksComponent
  ],
  imports: [
    CommonModule,
    BanksRoutingModule,
    MaterialModule
  ]
})
export class BanksModule { }
