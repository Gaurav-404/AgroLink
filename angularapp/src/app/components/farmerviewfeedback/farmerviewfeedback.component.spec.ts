import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerviewfeedbackComponent } from './farmerviewfeedback.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FarmerviewfeedbackComponent', () => {
  let component: FarmerviewfeedbackComponent;
  let fixture: ComponentFixture<FarmerviewfeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, FormsModule],
      declarations: [ FarmerviewfeedbackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmerviewfeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('Frontend_should_create_farmerviewfeedbackcomponent', () => {
    expect(component).toBeTruthy();
  });

  fit('Frontend_should_contain_view_feedback_heading_in_the_farmerviewfeedbackcomponent', () => {
    const componentHTML = fixture.debugElement.nativeElement.outerHTML;
    expect(componentHTML).toContain('My Feedback');
  });
});
