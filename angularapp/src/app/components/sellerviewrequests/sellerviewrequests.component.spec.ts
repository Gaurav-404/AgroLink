import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SellerviewrequestsComponent } from './sellerviewrequests.component';

describe('SellerviewrequestsComponent', () => {
  let component: SellerviewrequestsComponent;
  let fixture: ComponentFixture<SellerviewrequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, FormsModule],
      declarations: [ SellerviewrequestsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SellerviewrequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('Frontend_should_create_sellerviewrequestscomponent', () => {
    expect(component).toBeTruthy();
  });

  fit('Frontend_should_contain_chemical_requests_for_approval_heading_in_the_sellerviewrequestscomponent', () => {
    const componentHTML = fixture.debugElement.nativeElement.outerHTML;
    expect(componentHTML).toContain('Chemical Requests for Approval');
  });
});
