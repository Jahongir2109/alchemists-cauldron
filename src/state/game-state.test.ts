import { describe, expect, it } from 'vitest';

import { RECIPES } from '../data/recipes';
import type { IGameState, IRecipe } from '../types/game';
import {
  addIngredient,
  brew,
  createMenuState,
  finishIfOver,
  pauseGame,
  pourOut,
  resumeGame,
  selectDifficulty,
  startGame,
  updateTimeLeft,
} from './game-state';

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

  it('starts an Easy game with 180 s, 5 lives, the first 4 ingredients and an easy recipe', () => {
    const state = startGame('easy');

    expect(state.difficulty).toBe('easy');
    expect(state.timeLeft).toBe(180_000);
    expect(state.lives).toBe(5);
    expect(Object.keys(state.shelfStock)).toEqual([
      'dragon-tears',
      'fairy-dust',
      'frost-lotus',
      'mandrake-root',
    ]);
    expect(state.activeRecipe?.difficulty).toBe('easy');
  });

  it('starts a Hard game with 150 s, 3 lives, all 8 ingredients and a hard recipe', () => {
    const state = startGame('hard');

    expect(state.timeLeft).toBe(150_000);
    expect(state.lives).toBe(3);
    expect(Object.keys(state.shelfStock)).toHaveLength(8);
    expect(state.activeRecipe?.difficulty).toBe('hard');
  });

  it('gives every shelf ingredient a random stock from 2 to 15', () => {
    const stock: number[] = Object.values(startGame('hard').shelfStock);

    expect(stock.every((portions: number) => portions >= 2 && portions <= 15)).toBe(true);
  });

  it('changes the difficulty only on the start screen', () => {
    const menu = selectDifficulty(createMenuState('medium'), 'hard');

    expect(menu.difficulty).toBe('hard');
    expect(menu.status).toBe('menu');

    const running = startGame('easy');

    expect(selectDifficulty(running, 'hard')).toBe(running);
    expect(selectDifficulty(pauseGame(running), 'hard').difficulty).toBe('easy');
  });

  it('pours out the mixture for 10 seconds without losing a life', () => {
    let state: IGameState = {
      ...startWithStock({ 'toad-slime': 5 }),
      score: 400,
      timeLeft: 80_000,
    };

    state = addIngredient(addIngredient(state, 'toad-slime'), 'toad-slime');
    state = pourOut(state);

    expect(state.cauldronIngredients).toEqual([]);
    expect(state.timeLeft).toBe(70_000);
    expect(state.lives).toBe(3);
    expect(state.score).toBe(400);
    expect(state.shelfStock).toEqual({ 'toad-slime': 3 });
  });

  it('does nothing when the cauldron is empty or the game is paused', () => {
    const empty: IGameState = startWithStock({ 'toad-slime': 5 });
    const paused: IGameState = pauseGame(addIngredient(empty, 'toad-slime'));

    expect(pourOut(empty)).toBe(empty);
    expect(pourOut(paused)).toBe(paused);
  });

  it('ends the game when Pour Out uses the last seconds', () => {
    let state: IGameState = { ...startWithStock({ 'toad-slime': 5 }), timeLeft: 6_000 };

    state = pourOut(addIngredient(state, 'toad-slime'));

    expect(state.status).toBe('game-over');
    expect(state.gameOverReason).toBe('time');
  });

  it('allows 5 ingredients in the cauldron on Hard', () => {
    let state: IGameState = { ...startGame('hard'), shelfStock: { 'toad-slime': 9 } };

    for (let step = 0; step < 6; step += 1) {
      state = addIngredient(state, 'toad-slime');
    }

    expect(state.cauldronIngredients).toHaveLength(5);
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

    // Acid Spark 17..27 / 18..28 / 29..39 with tolerance 8: Dragon Tears + Caustic Acid = 35 / 22 / 32
    let state: IGameState = {
      ...startWithStock({ 'dragon-tears': 5, 'caustic-acid': 5 }),
      activeRecipe: acidSpark,
      timeLeft: 60_000,
    };

    state = addIngredient(addIngredient(state, 'dragon-tears'), 'caustic-acid');
    state = brew(state, () => 0.5);

    expect(state.lastBrewResult).toBe('success');
    expect(state.score).toBe(200);
    expect(state.timeLeft).toBe(70_000);
    expect(state.lives).toBe(3);
    expect(state.cauldronIngredients).toEqual([]);
    expect(state.shelfStock).toEqual({ 'dragon-tears': 4, 'caustic-acid': 4 });
    expect(state.activeRecipe?.difficulty).toBe('medium');
  });

  it('never adds time above the start time', () => {
    if (!acidSpark) {
      throw new Error('Acid Spark recipe is missing');
    }

    let state: IGameState = {
      ...startWithStock({ 'dragon-tears': 5, 'caustic-acid': 5 }),
      activeRecipe: acidSpark,
      timeLeft: 145_000,
    };

    state = brew(addIngredient(addIngredient(state, 'dragon-tears'), 'caustic-acid'));

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

  it('ends the game when the last life is lost', () => {
    if (!acidSpark) {
      throw new Error('Acid Spark recipe is missing');
    }

    let state: IGameState = {
      ...startWithStock({ 'void-essence': 5 }),
      activeRecipe: acidSpark,
      lives: 1,
    };

    state = brew(addIngredient(state, 'void-essence'));

    expect(state.status).toBe('game-over');
    expect(state.gameOverReason).toBe('lives');
  });

  it('ends the game when the time is over', () => {
    const state = updateTimeLeft(startWithStock({ 'fairy-dust': 5 }), -20);

    expect(state.timeLeft).toBe(0);
    expect(state.status).toBe('game-over');
    expect(state.gameOverReason).toBe('time');
  });

  it('keeps playing while the cauldron still has ingredients', () => {
    const state = addIngredient(startWithStock({ 'fairy-dust': 1 }), 'fairy-dust');

    expect(finishIfOver(state).status).toBe('playing');
  });

  it('ends with "Out of ingredients" when the shelf and the cauldron are empty', () => {
    if (!acidSpark) {
      throw new Error('Acid Spark recipe is missing');
    }

    let state: IGameState = { ...startWithStock({ 'fairy-dust': 1 }), activeRecipe: acidSpark };

    state = brew(addIngredient(state, 'fairy-dust'));

    expect(state.status).toBe('game-over');
    expect(state.gameOverReason).toBe('ingredients');
  });

  it('pauses and resumes only from the right state', () => {
    const playing = startWithStock({ 'fairy-dust': 5 });
    const paused = pauseGame(playing);

    expect(paused.status).toBe('paused');
    expect(pauseGame(paused)).toBe(paused);
    expect(resumeGame(paused).status).toBe('playing');
    expect(resumeGame(playing)).toBe(playing);
    expect(brew(addIngredient(paused, 'fairy-dust'))).toBe(paused);
  });

  it('ignores add actions outside of active play', () => {
    const state: IGameState = { ...startWithStock({ 'fairy-dust': 10 }), status: 'paused' };

    expect(addIngredient(state, 'fairy-dust')).toBe(state);
  });
});
