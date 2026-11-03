import { TestBed } from '@angular/core/testing';
import { Clock } from './clock';

describe('Clock', () => {
  it('donne l’heure courante', () => {
    const before = Date.now();
    const now = TestBed.inject(Clock).now().getTime();
    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(Date.now());
  });
});
