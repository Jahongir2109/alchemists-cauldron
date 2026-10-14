import { describe, expect, it } from 'vitest';

import { INGREDIENTS } from '../data/ingredients';
import type { IIngredient } from '../types/game';
import { calculateCauldron } from './calculate-cauldron';

const byId = (id: string): IIngredient => {
  const ingredient: IIngredient | undefined = INGREDIENTS.find(
    (item: IIngredient) => item.id === id,
  );

  if (!ingredient) {
    throw new Error(`Unknown ingredient ${id}`);
  }

  return ingredient;
};

describe('calculateCauldron', () => {
  it('starts an empty cauldron at 0 / 0 / 0', () => {
    expect(calculateCauldron([])).toEqual({ temperature: 0, density: 0, magicPower: 0 });
  });

  it('sums the values of the README worked example', () => {
    const values = calculateCauldron([byId('dragon-tears'), byId('fairy-dust')]);

    expect(values).toEqual({ temperature: 37, density: 17, magicPower: 22 });
  });

  it('supports negative values and repeated ingredients', () => {
    const values = calculateCauldron([byId('void-essence'), byId('void-essence')]);

    expect(values).toEqual({ temperature: -40, density: -20, magicPower: 80 });
  });
});
