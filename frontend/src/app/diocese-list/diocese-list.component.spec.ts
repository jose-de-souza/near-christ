import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DioceseListComponent } from './diocese-list.component';

describe('DioceseListComponent', () => {
  let component: DioceseListComponent;
  let fixture: ComponentFixture<DioceseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DioceseListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DioceseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
