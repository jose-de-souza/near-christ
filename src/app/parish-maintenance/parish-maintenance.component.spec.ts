import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParishMaintenanceComponent } from './parish-maintenance.component';

describe('ParishMaintenanceComponent', () => {
  let component: ParishMaintenanceComponent;
  let fixture: ComponentFixture<ParishMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParishMaintenanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParishMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
