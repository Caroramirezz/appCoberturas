import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Menu } from './menu.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  nombre_usuario:string = "";
  permiso_usuario:string = "";
  arrayMenu = [{}] as Menu[];

  constructor(
    private router:Router,
    ) { 
      this.nombre_usuario = sessionStorage.getItem("nombre_usuario")!.toString();
      this.permiso_usuario = sessionStorage.getItem("permiso_usuario")!.toString();
    }

  ngOnInit(): void {
    this.mostrarMenus();
  }


   mostrarMenus(){
    //SI ES ADMINISTRADOR(FINANZAS)
    if(this.permiso_usuario === '1'){
      this.arrayMenu = [
        {title:'Dashboard', icon:'dashboard',link:'/home/dashboard/usuario'},
        {title:'Trades', icon:'receipt_long',link:'/home/trade'},
        {
          title: 'Administración',
          icon: 'admin_panel_settings',
          children: [
            { title: 'Clientes', icon: 'settings_applications', link: '/home/admin/clients' },
            { title: 'Plantas', icon: 'settings_applications', link: '/home/admin/plants' },
            { title: 'SARS', icon: 'settings_applications', link: '/home/admin/sars' },
            { title: 'Bancos', icon: 'settings_applications', link: '/home/admin/banks' }
          ]
        }
      ];
    }
    else if(this.permiso_usuario === '2') {
      this.arrayMenu = [
        {title:'Dashboard', icon:'dashboard',link:'/home/dashboard/usuario'},
        {title:'', icon:'',link:''},
      ];
    }
    else {
      this.arrayMenu = [];
    }
   } 

  cerrarSesion(){
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigateByUrl("/auth/login");
  }
}
