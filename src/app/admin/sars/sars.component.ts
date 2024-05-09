import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sars',
  templateUrl: './sars.component.html',
  template: `<h1>SARS</h1><p>List of SARS will be displayed here.</p>`,
  styleUrls: ['./sars.component.scss']
})
export class SarsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
