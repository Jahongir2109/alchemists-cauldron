import { describe, expect, it } from 'vitest';

import { RECIPES } from '../data/recipes';
import type { IGameState, IRecipe } from '../types/game';
import { addIngredient, brew, createMenuState, startGame } from './game-state';

const acidSpark: IRecipe | undefined = RECIPES.find(
  (recipe: IRecipe) => recipe.id === 'acid-spark',
);

const startWithStock = (stock: Record<string, number>): IGameState => ({
  ...startGame('medium'),
  shelfStock: stock,
});

describe('game state', () => {
  it('starts on an empty start screen', () => {
    const state = createMenuState();

    expect(state.status).toBe('menu');
    expect(state.score).toBe(0);
    expect(state.timeLeft).toBe(0);
    expect(state.lives).toBe(0);
    expect(state.shelfStock).toEqual({});
    expect(state.cauldronIngredients).toEqual([]);
  });

  it('starts a Medium game with 150 s, 3 lives, 6 shelf ingredients and a medium recipe', () => {
    const state = startGame('medium');

    expect(state.status).toBe('playing');
    expect(state.timeLeft).toBe(150_000);
    expect(state.lives).toBe(3);
    expect(Object.keys(state.shelfStock)).toHaveLength(6);
    expect(state.activeRecipe?.difficulty).toBe('medium');
  });

  it('adds ingredients in order and spends the stock', () => {
    let state = startWithStock({ 'dragon-tears': 2, 'fairy-dust': 5 });

    state = addIngredient(state, 'fairy-dust');
    state = addIngredient(state, 'dragon-tears');
    state = addIngredient(state, 'dragon-tears');

    expect(state.cauldronIngredients.map((item) => item.id)).toEqual([
      'fairy-dust',
      'dragon-tears',
      'dragon-tears',
    ]);
    expect(state.shelfStock).toEqual({ 'dragon-tears': 0, 'fairy-dust': 4 });
  });

  it('ignores an ingredient with no stock', () => {
    const state = startWithStock({ 'dragon-tears': 0 });

    expect(addIngredient(state, 'dragon-tears')).toBe(state);
  });

  it('holds at most 4 ingredients', () => {
    let state = startWithStock({ 'fairy-dust': 10 });

    for (let index = 0; index < 6; index += 1) {
      state = addIngredient(state, 'fairy-dust');
    }

    expect(state.cauldronIngredients).toHaveLength(4);
    expect(state.shelfStock['fairy-dust']).toBe(6);
  });

  it('does nothing on brew with an empty cauldron', () => {
    const state = startWithStock({ 'fairy-dust': 10 });

    expect(brew(state)).toBe(state);
  });

  it('adds score and time, clears the cauldron and picks a new recipe on success', () => {
    if (!acidSpark) {
      throw new Error('Acid Spark recipe is missing');
    }

    // Acid Spark 17..27 / 18..28 / 29..39 with tolerance 8: Fairy Dust + Caustic Acid = 22 / 23 / 34
    let state: IGameState = {
      ...startWithStock({ 'fairy-dust': 5, 'caustic-acid': 5 }),
      activeRecipe: acidSpark,
      timeLeft: 60_000,
    };

    state = addIngredient(addIngredient(state, 'fairy-dust'), 'caustic-acid');
    state = brew(state, () => 0.5);

    expect(state.lastBrewResult).toBe('success');
    expect(state.score).toBe(200);
    expect(state.timeLeft).toBe(70_000);
    expect(state.lives).toBe(3);
    expect(state.cauldronIngredients).toEqual([]);
    expect(state.shelfStock).toEqual({ 'fairy-dust': 4, 'caustic-acid': 4 });
    expect(state.activeRecipe?.difficulty).toBe('medium');
  });

  it('never adds time above the start time', () => {
    if (!acidSpark) {
      throw new Error('Acid Spark recipe is missing');
    }

    let state: IGameState = {
      ...startWithStock({ 'fairy-dust': 5, 'caustic-acid': 5 }),
      activeRecipe: acidSpark,
      timeLeft: 145_000,
    };

    state = brew(addIngredient(addIngredient(state, 'fairy-dust'), 'caustic-acid'));

    expect(state.timeLeft).toBe(150_000);
  });

  it('loses a life and spends the ingredients on a wrong mixture', () => {
    if (!acidSpark) {
      throw new Error('Acid Spark recipe is missing');
    }

    let state: IGameState = {
      ...startWithStock({ 'void-essence': 5 }),
      activeRecipe: acidSpark,
    };

    state = brew(addIngredient(state, 'void-essence'));

    expect(state.lastBrewResult).toBe('failure');
    expect(state.lives).toBe(2);
    expect(state.score).toBe(0);
    expect(state.cauldronIngredients).toEqual([]);
    expect(state.shelfStock).toEqual({ 'void-essence': 4 });
    expect(state.activeRecipe).toBe(acidSpark);
  });

  it('ignores add actions outside of active play', () => {
    const state: IGameState = { ...startWithStock({ 'fairy-dust': 10 }), status: 'paused' };

    expect(addIngredient(state, 'fairy-dust')).toBe(state);
  });
});
