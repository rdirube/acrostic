import { TestBed } from '@angular/core/testing';

import { AcrosticAnswerService } from './acrostic-answer.service';

describe('AcrosticAnswerService', () => {
  let service: AcrosticAnswerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcrosticAnswerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
