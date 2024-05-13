import { TestBed } from '@angular/core/testing';

import { PlattsDataService } from './platts-data.service';

describe('PlattsDataService', () => {
  let service: PlattsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlattsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
