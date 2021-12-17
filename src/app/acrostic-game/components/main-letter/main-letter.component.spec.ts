import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLetterComponent } from './main-letter.component';

describe('MainLetterComponent', () => {
  let component: MainLetterComponent;
  let fixture: ComponentFixture<MainLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainLetterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
