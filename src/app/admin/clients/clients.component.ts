import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  template: `<h1>Clients</h1><p>List of clients will be displayed here.</p>`,
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
