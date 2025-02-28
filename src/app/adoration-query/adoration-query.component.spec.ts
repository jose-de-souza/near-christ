import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdorationQueryComponent } from './adoration-query.component';

describe('AdorationQueryComponent', () => {
  let component: AdorationQueryComponent;
  let fixture: ComponentFixture<AdorationQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdorationQueryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdorationQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
