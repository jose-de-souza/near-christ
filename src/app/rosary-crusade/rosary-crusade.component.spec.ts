import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RosaryCrusadeComponent } from './rosary-crusade.component';

describe('RosaryCrusadeComponent', () => {
  let component: RosaryCrusadeComponent;
  let fixture: ComponentFixture<RosaryCrusadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RosaryCrusadeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RosaryCrusadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
