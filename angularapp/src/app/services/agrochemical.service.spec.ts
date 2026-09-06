import { TestBed } from '@angular/core/testing';

import { AgrochemicalService } from './agrochemical.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AgrochemicalService', () => {
  let service: AgrochemicalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AgrochemicalService);
  });

  fit('Frontend_should_create_agrochemical_service', () => {
    expect(service).toBeTruthy();
  });
});
