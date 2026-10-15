import { describe, expect, it } from 'vitest';

import { getDifficultySettings } from '../data/difficulty';
import { findIngredient } from '../data/ingredients';
import { REACTIONS } from '../data/reactions';
import { addIngredient, brew, getCauldronValues, startGame } from '../state/game-state';
import type { Difficulty, IGameState, IIngredient } from '../types/game';
import { calculateMixture, getFiredReactions, getReactions } from './reactions';

const ingredients = (...ids: string[]): IIngredient[] =>
  ids.map((id: string) => {
    const ingredient: IIngredient | undefined = findIngredient(id);

    if (!ingredient) {
      throw new Error(`Unknown ingredient ${id}`);
    }

    return ingredient;
  });

const startWithStock = (difficulty: Difficulty, stock: Record<string, number>): IGameState => ({
  ...startGame(difficulty),
  shelfStock: stock,
  timeLeft: 100_000,
});

describe('reaction sets', () => {
  it('keeps the full catalog of 15 reactions', () => {
    expect(REACTIONS).toHaveLength(15);
  });

  it('enables none on Easy, 2 on Medium and 3 on Hard', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      expect(getReactions(difficulty)).toHaveLength(
        getDifficultySettings(difficulty).reactionCount,
      );
    }
  });
});

describe('calculateMixture', () => {
  it('applies Bubbling: Magic Power +50%', () => {
    // Fairy Dust + Caustic Acid = 22 / 23 / 34, then 34 * 1.5 = 51
    expect(
      calculateMixture(ingredients('fairy-dust', 'caustic-acid'), getReactions('medium')),
    ).toEqual({ temperature: 22, density: 23, magicPower: 51 });
  });

  it('applies Solar Frost: Temperature 0 and Density +20%', () => {
    // Dragon Tears + Frost Lotus = 7 / 12 / 24
    expect(
      calculateMixture(ingredients('dragon-tears', 'frost-lotus'), getReactions('medium')),
    ).toEqual({ temperature: 0, density: 14, magicPower: 24 });
  });

  it('uses plain sums on Easy', () => {
    expect(
      calculateMixture(ingredients('dragon-tears', 'frost-lotus'), getReactions('easy')),
    ).toEqual({ temperature: 7, density: 12, magicPower: 24 });
  });

  it('applies stats reactions on Hard: Magma Flux at Temperature >= 60', () => {
    // Phoenix Feather + Toad Slime + Dragon Tears = 80 / 28 / 40
    expect(
      calculateMixture(
        ingredients('phoenix-feather', 'toad-slime', 'dragon-tears'),
        getReactions('hard'),
      ),
    ).toEqual({ temperature: 80, density: 25, magicPower: 48 });
  });
});

describe('firing', () => {
  it('fires only when a reaction changes from not active to active', () => {
    const reactions = getReactions('medium');
    const pair: IIngredient[] = ingredients('fairy-dust', 'caustic-acid');

    expect(getFiredReactions(pair.slice(0, 1), pair, reactions).map((item) => item.id)).toEqual([
      'bubbling',
    ]);
    expect(getFiredReactions(pair, [...pair, ...ingredients('frost-lotus')], reactions)).toEqual(
      [],
    );
  });

  it('removes 10 seconds once for Bubbling', () => {
    let state = startWithStock('medium', { 'fairy-dust': 5, 'caustic-acid': 5 });

    state = addIngredient(state, 'fairy-dust');
    state = addIngredient(state, 'caustic-acid');

    expect(state.timeLeft).toBe(90_000);
    expect(state.lastReactionId).toBe('bubbling');

    state = addIngredient(state, 'caustic-acid');

    expect(state.timeLeft).toBe(90_000);
    expect(state.lastReactionId).toBeNull();
  });

  it('Volatile Mix costs a life and clears the cauldron on Hard', () => {
    let state = startWithStock('hard', { 'phoenix-feather': 5, 'void-essence': 5 });

    state = addIngredient(state, 'phoenix-feather');
    state = addIngredient(state, 'void-essence');

    expect(state.lives).toBe(2);
    expect(state.cauldronIngredients).toEqual([]);
    expect(state.shelfStock).toEqual({ 'phoenix-feather': 4, 'void-essence': 4 });
    expect(state.lastReactionId).toBe('volatile-mix');
  });

  it('checks the brew with the reaction values', () => {
    let state = startWithStock('medium', { 'fairy-dust': 5, 'caustic-acid': 5 });

    state = addIngredient(addIngredient(state, 'fairy-dust'), 'caustic-acid');

    expect(getCauldronValues(state).magicPower).toBe(51);
    expect(brew(state).lastReactionId).toBeNull();
  });
});
