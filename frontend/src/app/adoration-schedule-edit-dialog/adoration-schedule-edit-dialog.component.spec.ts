import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdorationScheduleEditDialogComponent } from './adoration-schedule-edit-dialog.component';

describe('AdorationScheduleEditDialogComponent', () => {
  let component: AdorationScheduleEditDialogComponent;
  let fixture: ComponentFixture<AdorationScheduleEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdorationScheduleEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdorationScheduleEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
