import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlattsComponent } from './platts.component';

describe('PlattsComponent', () => {
  let component: PlattsComponent;
  let fixture: ComponentFixture<PlattsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlattsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlattsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
