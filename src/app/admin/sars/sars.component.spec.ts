import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SarsComponent } from './sars.component';

describe('SarsComponent', () => {
  let component: SarsComponent;
  let fixture: ComponentFixture<SarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SarsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
