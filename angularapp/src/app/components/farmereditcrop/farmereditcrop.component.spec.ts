import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmereditcropComponent } from './farmereditcrop.component';

describe('FarmereditcropComponent', () => {
  let component: FarmereditcropComponent;
  let fixture: ComponentFixture<FarmereditcropComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FarmereditcropComponent]
    });
    fixture = TestBed.createComponent(FarmereditcropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
