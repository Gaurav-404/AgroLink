import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FarmerviewcropComponent } from './farmerviewcrop.component';

describe('FarmerviewcropComponent', () => {
  let component: FarmerviewcropComponent;
  let fixture: ComponentFixture<FarmerviewcropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, FormsModule],
      declarations: [ FarmerviewcropComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmerviewcropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('Frontend_should_create_farmerviewcropcomponent', () => {
    expect(component).toBeTruthy();
  });

  fit('Frontend_should_contain_crops_heading_in_the_farmerviewcropcomponent', () => {
    const componentHTML = fixture.debugElement.nativeElement.outerHTML;
    expect(componentHTML).toContain('Crops');
  });
});
