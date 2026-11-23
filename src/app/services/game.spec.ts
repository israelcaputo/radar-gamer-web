import { TestBed } from '@angular/core/testing';
import { GameService } from './game';

describe('GameService', () => {
  it('should be created', () => {
    expect(TestBed.inject(GameService)).toBeTruthy();
  });
});
