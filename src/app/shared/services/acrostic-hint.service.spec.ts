import { TestBed } from '@angular/core/testing';

import { AcrosticHintService } from './acrostic-hint.service';

describe('AcrosticHintService', () => {
  let service: AcrosticHintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcrosticHintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
