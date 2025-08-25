import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RosaryCrusadeEditDialogComponent } from './rosary-crusade-edit-dialog.component';

describe('RosaryCrusadeEditDialogComponent', () => {
  let component: RosaryCrusadeEditDialogComponent;
  let fixture: ComponentFixture<RosaryCrusadeEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RosaryCrusadeEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RosaryCrusadeEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
