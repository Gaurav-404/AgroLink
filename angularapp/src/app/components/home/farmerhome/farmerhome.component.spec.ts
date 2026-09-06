import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerhomeComponent } from './farmerhome.component';

describe('FarmerhomeComponent', () => {
  let component: FarmerhomeComponent;
  let fixture: ComponentFixture<FarmerhomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FarmerhomeComponent]
    });
    fixture = TestBed.createComponent(FarmerhomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
