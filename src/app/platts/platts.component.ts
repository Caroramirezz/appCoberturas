import { Component, OnInit } from '@angular/core';
import { PlattsService } from './platts.service';
import { DataItem } from './platts.interface';
import moment from 'moment';

@Component({
  selector: 'app-platts',
  templateUrl: './platts.component.html',
  styleUrls: ['./platts.component.scss']
})
export class PlattsComponent implements OnInit {

  response: any;
  responseHistory: any;
  tableData: DataItem[] = [];
  filteredData: DataItem[] = [];
  
  fechaInicio: Date = moment().startOf('month').toDate();
  fechaFin: Date = moment().endOf('month').toDate();
  bate: string = '';
  symbol: string = '';

  constructor(
    private WsPlatts:PlattsService
  ) { }

  ngOnInit(): void {
    this.WsPlatts.HistoryData().subscribe((data: DataItem[]) => {
      this.tableData = data;
      this.filteredData = data;
    });
  }

  filterData() {
    const startDate = moment(this.fechaInicio);
    const endDate = moment(this.fechaFin);
    
    this.filteredData = this.tableData.filter(item => {
      const assessDate = moment(item.assessDate);
      const matchDate = !this.fechaInicio || !this.fechaFin || (assessDate.isBetween(startDate, endDate, undefined, '[]'));
      const matchBate = !this.bate || item.bate.includes(this.bate);
      const matchSymbol = !this.symbol || item.symbol.includes(this.symbol);
      
      return matchDate && matchBate && matchSymbol;
    });
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
