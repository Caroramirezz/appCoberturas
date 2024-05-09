import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.component.html',
  template: `<h1>Banks</h1><p>List of banks will be displayed here.</p>`,
  styleUrls: ['./banks.component.scss']
})
export class BanksComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}