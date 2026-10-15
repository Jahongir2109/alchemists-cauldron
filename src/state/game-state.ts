import { DEFAULT_DIFFICULTY, getDifficultySettings } from '../data/difficulty';
import { findIngredient, getShelfIngredients } from '../data/ingredients';
import { checkBrew } from '../logic/brew-check';
import { calculateMixture, getFiredReactions, getReactions } from '../logic/reactions';
import { pickRecipe } from '../logic/recipe-generator';
import type { RandomSource } from '../logic/random';
import { createStock, hasStock, isShelfEmpty, takeFromStock } from '../logic/stock';
import { addTimeBonus, secondsToMs } from '../logic/timer';
import type {
  Difficulty,
  GameOverReason,
  ICauldronValues,
  IDifficultySettings,
  IGameState,
  IIngredient,
  IReaction,
  IReactionEffects,
} from '../types/game';

export type IRestoredGame = Pick<
  IGameState,
  | 'difficulty'
  | 'score'
  | 'timeLeft'
  | 'lives'
  | 'activeRecipe'
  | 'cauldronIngredients'
  | 'shelfStock'
>;

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
  lastReactionId: null,
});

// Continue Game: the saved run comes back paused, with the saved stock (not re-rolled).
export const restoreGame = (saved: IRestoredGame): IGameState => ({
  ...saved,
  cauldronIngredients: [...saved.cauldronIngredients],
  shelfStock: { ...saved.shelfStock },
  status: 'paused',
  gameOverReason: null,
  lastBrewResult: null,
  lastReactionId: null,
});

// The difficulty can be changed only on the start screen, never during a run.
export const selectDifficulty = (state: IGameState, difficulty: Difficulty): IGameState =>
  state.status === 'menu' && state.difficulty !== difficulty ? createMenuState(difficulty) : state;

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
    lastReactionId: null,
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

  const before: IIngredient[] = state.cauldronIngredients;
  const after: IIngredient[] = [...before, ingredient];
  const fired: IReaction[] = getFiredReactions(before, after, getReactions(state.difficulty));

  return finishIfOver(
    fired.reduce<IGameState>(applyReactionEffects, {
      ...state,
      cauldronIngredients: after,
      shelfStock: takeFromStock(state.shelfStock, id),
      lastBrewResult: null,
      lastReactionId: fired.at(-1)?.id ?? null,
    }),
  );
};

// One-time effects of a reaction that has just fired.
const applyReactionEffects = (state: IGameState, reaction: IReaction): IGameState => {
  const effects: IReactionEffects = reaction.effects ?? {};

  return {
    ...state,
    timeLeft: Math.max(0, state.timeLeft - secondsToMs(effects.timePenaltySeconds ?? 0)),
    lives: Math.max(0, state.lives - (effects.lifePenalty ?? 0)),
    cauldronIngredients: effects.clearsCauldron ? [] : state.cauldronIngredients,
  };
};

// Current cauldron values: base sums with the active reactions of this difficulty.
export const getCauldronValues = (state: IGameState): ICauldronValues =>
  calculateMixture(state.cauldronIngredients, getReactions(state.difficulty));

// Lives first, then time, then "Out of ingredients": the shelf and the cauldron are both empty.
export const getGameOverReason = (state: IGameState): GameOverReason | null => {
  if (state.lives <= 0) {
    return 'lives';
  }

  if (state.timeLeft <= 0) {
    return 'time';
  }

  if (isShelfEmpty(state.shelfStock) && state.cauldronIngredients.length === 0) {
    return 'ingredients';
  }

  return null;
};

export const finishIfOver = (state: IGameState): IGameState => {
  if (state.status !== 'playing') {
    return state;
  }

  const reason: GameOverReason | null = getGameOverReason(state);

  return reason ? { ...state, status: 'game-over', gameOverReason: reason } : state;
};

// Used ingredients are always spent: the cauldron is cleared and the stock is not refilled.
export const brew = (state: IGameState, random: RandomSource = Math.random): IGameState => {
  if (!canBrew(state) || !state.activeRecipe) {
    return state;
  }

  const settings: IDifficultySettings = getSettings(state);
  const { isSuccess } = checkBrew(getCauldronValues(state), state.activeRecipe, settings.tolerance);
  const cleared: IGameState = { ...state, cauldronIngredients: [], lastReactionId: null };

  if (!isSuccess) {
    return finishIfOver({
      ...cleared,
      lives: Math.max(0, state.lives - 1),
      lastBrewResult: 'failure',
    });
  }

  return finishIfOver({
    ...cleared,
    score: state.score + settings.scorePerBrew,
    timeLeft: addTimeBonus(
      state.timeLeft,
      secondsToMs(settings.timeBonusSeconds),
      secondsToMs(settings.startTimeSeconds),
    ),
    activeRecipe: pickRecipe(state.difficulty, random),
    lastBrewResult: 'success',
  });
};

export const pauseGame = (state: IGameState): IGameState =>
  state.status === 'playing' ? { ...state, status: 'paused' } : state;

export const resumeGame = (state: IGameState): IGameState =>
  state.status === 'paused' ? { ...state, status: 'playing' } : state;

// The remaining time always comes from the timestamp timer, the state only stores it.
export const updateTimeLeft = (state: IGameState, timeLeft: number): IGameState =>
  finishIfOver({ ...state, timeLeft: Math.max(0, timeLeft) });
