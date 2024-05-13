import { Component, OnInit } from '@angular/core';
import { PlattsDataService } from '../platts-data.service';

@Component({
  selector: 'app-market-data',
  templateUrl: './market-data.component.html',
  styleUrls: ['./market-data.component.scss']
})
export class MarketDataComponent implements OnInit {

  marketData: any = [];

  constructor(private plattsDataService: PlattsDataService) { }

  ngOnInit(): void {
    this.plattsDataService.getMarketData().subscribe({
      next: (data) => {
        this.marketData = data;
      },
      error: (error) => {
        console.error('Error fetching data: ', error);
      }
    });
  }
}
