import { TestBed } from '@angular/core/testing';

import { CropService } from './crop.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CropService', () => {
  let service: CropService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CropService);
  });

  fit('Frontend_should_create_crop_service', () => {
    expect(service).toBeTruthy();
  });
});
