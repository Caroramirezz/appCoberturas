import { Component, OnInit } from '@angular/core';
import { BanksService } from './services/banks.service';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.component.html',
  styleUrls: ['./banks.component.scss']
})
export class BanksComponent implements OnInit {
  banks: any[] = [];

  constructor() {
    this.banks = [];
  }

  ngOnInit(): void {
    /*this.banksService.getBanks().subscribe({
      next: (data) => {
        this.banks = data;
      },
      error: (err) => console.error(err),
      complete: () => console.log('Banks data retrieval complete')
    });
  */}
}
