import { describe, expect, it } from 'vitest';

import { RECIPES } from '../data/recipes';
import type { IRecipe } from '../types/game';
import { checkBrew, expandRange, isInRange } from './brew-check';

const moonMist: IRecipe | undefined = RECIPES.find((recipe: IRecipe) => recipe.id === 'moon-mist');

describe('brew check', () => {
  it('expands a range by the tolerance', () => {
    expect(expandRange({ min: 32, max: 42 }, 8)).toEqual({ min: 24, max: 50 });
  });

  it('includes both range borders', () => {
    expect(isInRange(24, { min: 24, max: 50 })).toBe(true);
    expect(isInRange(50, { min: 24, max: 50 })).toBe(true);
    expect(isInRange(51, { min: 24, max: 50 })).toBe(false);
  });

  it('passes the README worked example with tolerance 8', () => {
    if (!moonMist) {
      throw new Error('Moon Mist recipe is missing');
    }

    const result = checkBrew({ temperature: 37, density: 17, magicPower: 22 }, moonMist, 8);

    expect(result.isSuccess).toBe(true);
  });

  it('fails when one parameter is outside the checked range', () => {
    if (!moonMist) {
      throw new Error('Moon Mist recipe is missing');
    }

    const result = checkBrew({ temperature: 37, density: 31, magicPower: 22 }, moonMist, 8);

    expect(result.isSuccess).toBe(false);
    expect(result.parameters).toEqual({ temperature: true, density: false, magicPower: true });
  });
});
