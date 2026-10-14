import { DEFAULT_DIFFICULTY, getDifficultySettings } from '../data/difficulty';
import { findIngredient, getShelfIngredients } from '../data/ingredients';
import { pickRecipe } from '../logic/recipe-generator';
import type { RandomSource } from '../logic/random';
import { createStock, hasStock, takeFromStock } from '../logic/stock';
import { secondsToMs } from '../logic/timer';
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
