import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdorationScheduleComponent } from './adoration-schedule.component';

describe('AdorationScheduleComponent', () => {
  let component: AdorationScheduleComponent;
  let fixture: ComponentFixture<AdorationScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdorationScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdorationScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
