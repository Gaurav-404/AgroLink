import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FarmeraddfeedbackComponent } from './farmeraddfeedback.component';

describe('FarmeraddfeedbackComponent', () => {
  let component: FarmeraddfeedbackComponent;
  let fixture: ComponentFixture<FarmeraddfeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, FormsModule],
      declarations: [ FarmeraddfeedbackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmeraddfeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('Frontend_should_create_farmeraddfeedbackcomponent', () => {
    expect(component).toBeTruthy();
  });

  fit('Frontend_should_contain_add_feedback_heading_in_the_farmeraddfeedbackcomponent', () => {
    const componentHTML = fixture.debugElement.nativeElement.outerHTML;
    expect(componentHTML).toContain('Add Feedback');
  });
});
