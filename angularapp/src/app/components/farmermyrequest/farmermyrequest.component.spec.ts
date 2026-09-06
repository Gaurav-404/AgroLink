import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FarmermyrequestComponent } from './farmermyrequest.component';

describe('FarmermyrequestComponent', () => {
  let component: FarmermyrequestComponent;
  let fixture: ComponentFixture<FarmermyrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, FormsModule],
      declarations: [ FarmermyrequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmermyrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('Frontend_should_create_farmermyrequestcomponent', () => {
    expect(component).toBeTruthy();
  });

  fit('Frontend_should_contain_my_requests_heading_in_the_farmermyrequestcomponent', () => {
    const componentHTML = fixture.debugElement.nativeElement.outerHTML;
    expect(componentHTML).toContain('My Requests');
  });
});
