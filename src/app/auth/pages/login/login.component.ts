import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Usuario } from '../../interfaces/usuario.interface';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public formLogin:FormGroup;
  public usuario = {} as Usuario;  

  constructor(
    public fb: FormBuilder, 
    private router:Router, 
    private spinner: NgxSpinnerService,
    private wsAuth:AuthService,
    private toastr: ToastrService,  
    ) { 
      this.formLogin = this.fb.group({
        'email': new FormControl(null, [Validators.required]),
        'password': new FormControl(null, [Validators.required]),
      });     
      
    }

  ngOnInit(): void {
    
  }

  iniciar() {
    this.spinner.show(); 
  
    if (this.formLogin.valid) {
      this.usuario.email_usuario = this.formLogin.controls['email'].value;
      this.usuario.password_usuario = this.formLogin.controls['password'].value;
  
      this.wsAuth.iniciarSesion(this.usuario).subscribe(result => {
        
        if (result.token && result.token.resultado) { 
          var data = result.token.data; 
          
          sessionStorage.setItem("permiso_usuario", data.permiso_usuario.toString());
          sessionStorage.setItem("nombre_usuario", data.nombre_usuario);
          sessionStorage.setItem("id_usuario", data.id_usuario.toString());    
          sessionStorage.setItem("email_usuario", data.email_usuario);        
  
          this.usuario.id_usuario = data.id_usuario;    
          this.usuario.email_usuario = data.email_usuario;
          this.usuario.nombre_usuario = data.nombre_usuario;
          this.usuario.permiso_usuario = data.permiso_usuario;
  
          this.spinner.hide();
          this.router.navigateByUrl('home/dashboard');
        } 
        else {
          this.spinner.hide();
          this.toastr.error(result.token?.msg || 'Error al iniciar sesión', '', {
            timeOut: 5000,
          }); 
        }
  
      },
      error => {
        console.log(error);
        this.spinner.hide();
        this.toastr.error('Ocurrió un error al iniciar sesión', '', {
          timeOut: 5000,
        });
      })  
    } 
    else {
      this.toastr.error('Favor de completar la información', '', {
        timeOut: 5000,
      });
      this.spinner.hide();
    }
  }
  
  // iniciarSesionAliax(){  
  //   this.spinner.show(); 
  //   this.wsAuth.iniciarSesion().subscribe(result => {                              
  //     this.access_token = result.access_token;
  //     sessionStorage.setItem("access_token", this.access_token);
  //     this.router.navigateByUrl('home/dashboard');
            
  //   },
  //   error => {
  //     console.log(error);
  //   })    
  //   this.spinner.hide();     
  // }




}
