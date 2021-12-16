import { TestBed } from '@angular/core/testing';

import { AcrosticChallengeService } from './acrostic-challenge.service';

describe('AcrosticChallengeService', () => {
  let service: AcrosticChallengeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcrosticChallengeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
