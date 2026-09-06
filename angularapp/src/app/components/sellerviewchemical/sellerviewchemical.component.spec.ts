import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SellerviewchemicalComponent } from './sellerviewchemical.component';

describe('SellerviewchemicalComponent', () => {
  let component: SellerviewchemicalComponent;
  let fixture: ComponentFixture<SellerviewchemicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, FormsModule],
      declarations: [ SellerviewchemicalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SellerviewchemicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('Frontend_should_create_sellerviewchemicalcomponent', () => {
    expect(component).toBeTruthy();
  });


});
