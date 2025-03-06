import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DioceseMaintenanceComponent } from './diocese-maintenance.component';

describe('DioceseMaintenanceComponent', () => {
  let component: DioceseMaintenanceComponent;
  let fixture: ComponentFixture<DioceseMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DioceseMaintenanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DioceseMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
