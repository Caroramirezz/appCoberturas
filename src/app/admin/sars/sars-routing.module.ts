import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SarsComponent } from './sars.component';

const routes: Routes = [
  {
    path: '',
    component: SarsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SarsRoutingModule { }
