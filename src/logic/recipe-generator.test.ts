import { describe, expect, it } from 'vitest';

import { RECIPES } from '../data/recipes';
import { getRecipesByDifficulty, pickRecipe } from './recipe-generator';

describe('recipes', () => {
  it('keeps a fixed pool of 20 recipes', () => {
    expect(RECIPES).toHaveLength(20);
  });

  it('splits the pool into 6 easy, 7 medium and 7 hard recipes', () => {
    expect(getRecipesByDifficulty('easy')).toHaveLength(6);
    expect(getRecipesByDifficulty('medium')).toHaveLength(7);
    expect(getRecipesByDifficulty('hard')).toHaveLength(7);
  });

  it('picks only recipes of the requested difficulty', () => {
    for (let index = 0; index < 50; index += 1) {
      expect(pickRecipe('medium').difficulty).toBe('medium');
    }
  });

  it('uses the random source to choose the recipe', () => {
    expect(pickRecipe('medium', () => 0).name).toBe('Acid Spark');
    expect(pickRecipe('medium', () => 0.9999).name).toBe('Rooted Night');
  });
});
