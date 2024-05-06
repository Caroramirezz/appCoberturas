import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ConsultaTradeComponent } from '../pages/consulta-trade/consulta.component';
import { FirstStepComponent } from '../pages/new-trade/first-step/first-step.component';
import { SecondStepComponent } from '../pages/new-trade/second-step/second-step.component';
import { DetalleComponent } from '../pages/detalle/detalle.component';



const routes:Routes = [
  {
    path:'',
    children: [
      { path:'', component:ConsultaTradeComponent }, 
      { path:'step-1', component:FirstStepComponent },
      { path:'step-2', component:SecondStepComponent },    
      { path:'step-1/:id', component:FirstStepComponent },
      { path:'step-2/:id', component:SecondStepComponent },    
      { path:'**', redirectTo: '' }
    ]
  }
];

@NgModule({
  declarations: [  

  ],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class TradeRoutingModule { }
