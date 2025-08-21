import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParishEditDialogComponent } from './parish-edit-dialog.component';

describe('ParishEditDialogComponent', () => {
  let component: ParishEditDialogComponent;
  let fixture: ComponentFixture<ParishEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParishEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParishEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
