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
          title: 'Market Prices',
          icon: 'query_stats',
          children: [
            {title:'Platts', iconPath:'assets/images/platts_logo.png', link:'/home/platts'},
            {title:'Bloomberg', iconPath:'assets/images/bloomberg_logo.png',link:'/home/bloomberg',  customClass: 'bloomberg-icon'},
          ]
        },
        {
          title: 'Catalogs',
          icon: 'admin_panel_settings',
          children: [
            { title: 'Clients', icon: 'groups', link: '/home/admin/clients/consulta' },
            //{ title: 'Plantas', icon: 'settings_applications', link: '/home/admin/plants/consulta' },
            { title: 'SARS', icon: 'trending_up', link: '/home/admin/sars/consulta' },
            { title: 'Banks', icon: 'account_balance', link: '/home/admin/banks/consulta' },
            { title: 'Indexes', icon: 'pin', link: '/home/admin/indexes/consulta' },
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
