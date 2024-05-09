import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SarsRoutingModule } from './sars-routing.module';
import { SarsComponent } from './sars.component';


@NgModule({
  declarations: [
    SarsComponent
  ],
  imports: [
    CommonModule,
    SarsRoutingModule
  ]
})
export class SarsModule { }
