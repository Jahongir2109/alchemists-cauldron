import { describe, expect, it } from 'vitest';

import type { IGameState } from '../types/game';
import { addIngredient, createMenuState, startGame } from './game-state';

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

  it('ignores add actions outside of active play', () => {
    const state: IGameState = { ...startWithStock({ 'fairy-dust': 10 }), status: 'paused' };

    expect(addIngredient(state, 'fairy-dust')).toBe(state);
  });
});
