import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardHomeComponent implements OnInit {

  private permiso_usuario:any = "";  

  constructor(private router:Router) {  
    this.permiso_usuario = sessionStorage.getItem("permiso_usuario");
  }

  ngOnInit(): void {  
    //Permiso Finanzas o Administrador
    // if(this.permiso_usuario == "1"){
    //   this.router.navigateByUrl('home/dashboard/finanzas');
    // }
    // //Permiso usuario mortal o colaborador.
    // else {
    //   this.router.navigateByUrl('home/dashboard/usuario');
    // }

    this.router.navigateByUrl('home/dashboard/usuario');
  }

}
