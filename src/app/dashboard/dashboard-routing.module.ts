import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardFinanzasComponent } from './pages/dashboard-finanzas/dashboard-finanzas.component';
import { DashboardHomeComponent } from './home/dashboard.component';
import { DashboardUsuarioComponent } from './pages/dashboard-usuario/dashboard-usuario.component';


const routes:Routes = [
  {
    path:'',    
    children: [
      { path:'', component:DashboardHomeComponent },   
      { path:'finanzas', component:DashboardFinanzasComponent },
      { path:'usuario', component:DashboardUsuarioComponent},
      { path:'**', redirectTo: '' }
    ]
  }
];

@NgModule({  
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class DashboardRoutingModule { }
