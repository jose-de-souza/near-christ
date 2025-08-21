import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DioceseEditDialogComponent } from './diocese-edit-dialog.component';

describe('DioceseEditDialogComponent', () => {
  let component: DioceseEditDialogComponent;
  let fixture: ComponentFixture<DioceseEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DioceseEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DioceseEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
