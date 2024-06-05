import { Component, OnInit } from '@angular/core';
import { PlattsService } from './platts.service';

@Component({
  selector: 'app-platts',
  templateUrl: './platts.component.html',
  styleUrls: ['./platts.component.scss']
})
export class PlattsComponent implements OnInit {

  response:any;
  responseHistory:any;

  constructor(
    private WsPlatts:PlattsService
  ) { }

  ngOnInit(): void {
  }


  request(){
    this.WsPlatts.getToken().subscribe(result => {                              
      
      this.response = result;
      sessionStorage.setItem("access_token", this.response.access_token);
      sessionStorage.setItem("refresh_token", this.response.refresh_token);
      
      //this.router.navigateByUrl('home/dashboard');
            
    },
    error => {
      console.log(error);
    })    
  }

  getHistory(){
    this.WsPlatts.HistoryData().subscribe(result => {                              
      
      this.responseHistory = result;
      
      //this.router.navigateByUrl('home/dashboard');
            
    },
    error => {
      console.log(error);
    })    
  }
}
