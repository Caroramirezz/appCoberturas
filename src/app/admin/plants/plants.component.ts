import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-plants',
  templateUrl: './plants.component.html',
  template: `<h1>Plants</h1><p>List of plants will be displayed here.</p>`,
  styleUrls: ['./plants.component.scss']
})
export class PlantsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
