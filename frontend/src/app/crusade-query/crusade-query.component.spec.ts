import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrusadeQueryComponent } from './crusade-query.component';

describe('CrusadeQueryComponent', () => {
  let component: CrusadeQueryComponent;
  let fixture: ComponentFixture<CrusadeQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrusadeQueryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrusadeQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
