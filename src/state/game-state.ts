import { DEFAULT_DIFFICULTY, getDifficultySettings } from '../data/difficulty';
import { findIngredient, getShelfIngredients } from '../data/ingredients';
import { checkBrew } from '../logic/brew-check';
import { calculateCauldron } from '../logic/calculate-cauldron';
import { pickRecipe } from '../logic/recipe-generator';
import type { RandomSource } from '../logic/random';
import { createStock, hasStock, takeFromStock } from '../logic/stock';
import { addTimeBonus, secondsToMs } from '../logic/timer';
import type { Difficulty, IDifficultySettings, IGameState, IIngredient } from '../types/game';

export const getSettings = (state: IGameState): IDifficultySettings =>
  getDifficultySettings(state.difficulty);

// Start screen: empty shelf and cauldron, score and time 0, no lives yet.
export const createMenuState = (difficulty: Difficulty = DEFAULT_DIFFICULTY): IGameState => ({
  status: 'menu',
  difficulty,
  score: 0,
  timeLeft: 0,
  lives: 0,
  activeRecipe: null,
  cauldronIngredients: [],
  shelfStock: {},
  gameOverReason: null,
  lastBrewResult: null,
});

export const startGame = (
  difficulty: Difficulty = DEFAULT_DIFFICULTY,
  random: RandomSource = Math.random,
): IGameState => {
  const settings: IDifficultySettings = getDifficultySettings(difficulty);

  return {
    status: 'playing',
    difficulty,
    score: 0,
    timeLeft: secondsToMs(settings.startTimeSeconds),
    lives: settings.lives,
    activeRecipe: pickRecipe(difficulty, random),
    cauldronIngredients: [],
    shelfStock: createStock(getShelfIngredients(settings.shelfSize), random),
    gameOverReason: null,
    lastBrewResult: null,
  };
};

export const isCauldronFull = (state: IGameState): boolean =>
  state.cauldronIngredients.length >= getSettings(state).maxCauldronIngredients;

export const canAddIngredient = (state: IGameState, id: string): boolean =>
  state.status === 'playing' && !isCauldronFull(state) && hasStock(state.shelfStock, id);

export const canBrew = (state: IGameState): boolean =>
  state.status === 'playing' && state.activeRecipe !== null && state.cauldronIngredients.length > 0;

// Returns the same state object when the action is not allowed.
export const addIngredient = (state: IGameState, id: string): IGameState => {
  const ingredient: IIngredient | undefined = findIngredient(id);

  if (!ingredient || !canAddIngredient(state, id)) {
    return state;
  }

  return {
    ...state,
    cauldronIngredients: [...state.cauldronIngredients, ingredient],
    shelfStock: takeFromStock(state.shelfStock, id),
    lastBrewResult: null,
  };
};

// Used ingredients are always spent: the cauldron is cleared and the stock is not refilled.
export const brew = (state: IGameState, random: RandomSource = Math.random): IGameState => {
  if (!canBrew(state) || !state.activeRecipe) {
    return state;
  }

  const settings: IDifficultySettings = getSettings(state);
  const { isSuccess } = checkBrew(
    calculateCauldron(state.cauldronIngredients),
    state.activeRecipe,
    settings.tolerance,
  );
  const cleared: IGameState = { ...state, cauldronIngredients: [] };

  if (!isSuccess) {
    return { ...cleared, lives: Math.max(0, state.lives - 1), lastBrewResult: 'failure' };
  }

  return {
    ...cleared,
    score: state.score + settings.scorePerBrew,
    timeLeft: addTimeBonus(
      state.timeLeft,
      secondsToMs(settings.timeBonusSeconds),
      secondsToMs(settings.startTimeSeconds),
    ),
    activeRecipe: pickRecipe(state.difficulty, random),
    lastBrewResult: 'success',
  };
};
