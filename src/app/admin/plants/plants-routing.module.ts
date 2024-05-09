import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlantsComponent } from './plants.component';

const routes: Routes = [
  {
    path: '',
    component: PlantsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlantsRoutingModule { }
