import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMaintenanceEditDialogComponent } from './user-maintenance-edit-dialog.component';

describe('UserMaintenanceEditDialogComponent', () => {
  let component: UserMaintenanceEditDialogComponent;
  let fixture: ComponentFixture<UserMaintenanceEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMaintenanceEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMaintenanceEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
