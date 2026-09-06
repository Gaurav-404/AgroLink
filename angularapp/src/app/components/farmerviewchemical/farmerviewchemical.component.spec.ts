import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FarmerviewchemicalComponent } from './farmerviewchemical.component';

describe('FarmerviewchemicalComponent', () => {
  let component: FarmerviewchemicalComponent;
  let fixture: ComponentFixture<FarmerviewchemicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, FormsModule],
      declarations: [ FarmerviewchemicalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmerviewchemicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('Frontend_should_create_farmerviewchemicalcomponent', () => {
    expect(component).toBeTruthy();
  });

  fit('Frontend_should_contain_available_agrochemicals_heading_in_the_farmerviewchemicalcomponent', () => {
    const componentHTML = fixture.debugElement.nativeElement.outerHTML;
    expect(componentHTML).toContain('Available Agrochemicals');
  });
});
