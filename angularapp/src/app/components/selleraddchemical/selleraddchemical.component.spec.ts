import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SelleraddchemicalComponent } from './selleraddchemical.component';

describe('SelleraddchemicalComponent', () => {
  let component: SelleraddchemicalComponent;
  let fixture: ComponentFixture<SelleraddchemicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, FormsModule],
      declarations: [ SelleraddchemicalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelleraddchemicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('Frontend_should_create_selleraddchemicalcomponent', () => {
    expect(component).toBeTruthy();
  });

  fit('Frontend_should_contain_create_new_agrochemical_heading_in_the_selleraddchemicalcomponent', () => {
    const componentHTML = fixture.debugElement.nativeElement.outerHTML;
    expect(componentHTML).toContain('Create New AgroChemical');
  });
});
