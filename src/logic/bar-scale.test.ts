import { describe, expect, it } from 'vitest';

import { toFillSegment, toPercent, toSegment } from './bar-scale';

const symmetric = { min: -100, max: 100 };

describe('bar scale', () => {
  it('puts 0 in the center of a symmetric bar', () => {
    expect(toPercent(0, symmetric)).toBe(50);
    expect(toPercent(-50, symmetric)).toBe(25);
  });

  it('clamps values outside the scale', () => {
    expect(toPercent(250, symmetric)).toBe(100);
    expect(toPercent(-250, symmetric)).toBe(0);
  });

  it('converts a range to a segment', () => {
    expect(toSegment({ min: 0, max: 50 }, symmetric)).toEqual({ start: 50, width: 25 });
  });

  it('fills from the zero line in both directions', () => {
    expect(toFillSegment(40, symmetric)).toEqual({ start: 50, width: 20 });
    expect(toFillSegment(-40, symmetric)).toEqual({ start: 30, width: 20 });
  });
});
