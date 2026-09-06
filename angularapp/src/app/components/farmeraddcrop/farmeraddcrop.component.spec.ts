import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FarmeraddcropComponent } from './farmeraddcrop.component';

describe('FarmeraddcropComponent', () => {
  let component: FarmeraddcropComponent;
  let fixture: ComponentFixture<FarmeraddcropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FarmeraddcropComponent ],
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule, FormsModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmeraddcropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('Frontend_should_create_farmeraddcropcomponent', () => {
    expect(component).toBeTruthy();
  });

  fit('Frontend_should_contain_wrong_message_in_the_farmeraddcropcomponent', () => {
    const componentHTML = fixture.debugElement.nativeElement.outerHTML;
    expect(componentHTML).toContain('Create New Crop');
  });
});
