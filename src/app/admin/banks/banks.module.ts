import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BanksRoutingModule } from './banks-routing.module';
import { BanksComponent } from './banks.component';


@NgModule({
  declarations: [
    BanksComponent
  ],
  imports: [
    CommonModule,
    BanksRoutingModule
  ]
})
export class BanksModule { }
