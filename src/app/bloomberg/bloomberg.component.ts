import { Component, OnInit } from '@angular/core';
import { BloombergService } from './bloomberg.service';

@Component({
  selector: 'app-root',
  templateUrl: './bloomberg.component.html',
  styleUrls: ['./bloomberg.component.scss']
})
export class BloombergComponent implements OnInit {
  content: any;
  private requestIdentifier = 'uYDjpyki9yaX'; // id en el url
  private snapshotDate = '20240710'; // fecha creada del url

  constructor(private bloombergService: BloombergService) {}

  ngOnInit() {
    this.performDataRequest();
  }

  async performDataRequest() {
    try {
      // Get the distribution content
      this.content = await this.bloombergService.getDistributionUrl(this.requestIdentifier, this.snapshotDate);
      console.log('File content:', this.content);
    } catch (error) {
      console.error('Error in data request process:', error);
    }
  }
}