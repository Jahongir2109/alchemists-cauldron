import { describe, expect, it } from 'vitest';

import { getShelfIngredients } from '../data/ingredients';
import { createStock, isShelfEmpty, STOCK_MAX, STOCK_MIN, takeFromStock } from './stock';

describe('createStock', () => {
  it('gives every shelf ingredient a whole number from 2 to 15', () => {
    const stock = createStock(getShelfIngredients(6));

    expect(Object.keys(stock)).toHaveLength(6);

    for (const portions of Object.values(stock)) {
      expect(Number.isInteger(portions)).toBe(true);
      expect(portions).toBeGreaterThanOrEqual(STOCK_MIN);
      expect(portions).toBeLessThanOrEqual(STOCK_MAX);
    }
  });

  it('reaches both ends of the range', () => {
    const ingredients = getShelfIngredients(1);

    expect(createStock(ingredients, () => 0)).toEqual({ 'dragon-tears': 2 });
    expect(createStock(ingredients, () => 0.9999)).toEqual({ 'dragon-tears': 15 });
  });
});

describe('takeFromStock', () => {
  it('reduces the stock by 1 without changing the original', () => {
    const stock = { 'dragon-tears': 2 };

    expect(takeFromStock(stock, 'dragon-tears')).toEqual({ 'dragon-tears': 1 });
    expect(stock).toEqual({ 'dragon-tears': 2 });
  });

  it('never goes below 0', () => {
    const stock = { 'dragon-tears': 0 };

    expect(takeFromStock(stock, 'dragon-tears')).toBe(stock);
  });
});

describe('isShelfEmpty', () => {
  it('is true only when every stock is 0', () => {
    expect(isShelfEmpty({ a: 0, b: 0 })).toBe(true);
    expect(isShelfEmpty({ a: 0, b: 1 })).toBe(false);
  });
});
