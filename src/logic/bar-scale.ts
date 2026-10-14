import type { IRecipeRange } from '../types/game';

const PERCENT = 100;

// Position of a value on a bar in percent, clamped to the visible scale.
export const toPercent = (value: number, scale: IRecipeRange): number => {
  const ratio: number = (value - scale.min) / (scale.max - scale.min);

  return Math.min(PERCENT, Math.max(0, ratio * PERCENT));
};

export interface IBarSegment {
  start: number;
  width: number;
}

export const toSegment = (range: IRecipeRange, scale: IRecipeRange): IBarSegment => {
  const start: number = toPercent(range.min, scale);

  return { start, width: toPercent(range.max, scale) - start };
};

// Fill from the zero line (or the left edge when 0 is the minimum) to the value.
export const toFillSegment = (value: number, scale: IRecipeRange): IBarSegment => {
  const zero: number = toPercent(0, scale);
  const point: number = toPercent(value, scale);

  return { start: Math.min(zero, point), width: Math.abs(point - zero) };
};
