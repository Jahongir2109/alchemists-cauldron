import { getDifficultySettings, isDifficulty } from '../data/difficulty';
import { findIngredient, getShelfIngredients } from '../data/ingredients';
import { RECIPES } from '../data/recipes';
import { STOCK_MAX } from '../logic/stock';
import { secondsToMs } from '../logic/timer';
import type {
  Difficulty,
  IDifficultySettings,
  IGameState,
  IIngredient,
  IRecipe,
  ShelfStock,
} from '../types/game';
import { isRecord, readJson, removeItem, writeJson } from './safe-storage';

export const SAVE_KEY = 'alchemists-cauldron:save';

export type SavedStatus = Extract<IGameState['status'], 'playing' | 'paused'>;

export interface ISavedGame {
  difficulty: Difficulty;
  score: number;
  timeLeft: number; // milliseconds
  lives: number;
  activeRecipe: IRecipe;
  cauldronIngredients: IIngredient[];
  shelfStock: ShelfStock;
  status: SavedStatus;
}

const isSavedStatus = (value: unknown): value is SavedStatus =>
  value === 'playing' || value === 'paused';

const isWholeNumber = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;

const findRecipe = (value: unknown, difficulty: Difficulty): IRecipe | undefined =>
  isRecord(value)
    ? RECIPES.find((recipe: IRecipe) => recipe.id === value.id && recipe.difficulty === difficulty)
    : undefined;

const toIngredient = (value: unknown): IIngredient | undefined =>
  isRecord(value) && typeof value.id === 'string' ? findIngredient(value.id) : undefined;

const isValidStock = (value: unknown, difficulty: Difficulty): value is ShelfStock => {
  if (!isRecord(value)) {
    return false;
  }

  const ids: string[] = getShelfIngredients(getDifficultySettings(difficulty).shelfSize).map(
    (ingredient: IIngredient) => ingredient.id,
  );

  return (
    Object.keys(value).length === ids.length &&
    ids.every((id: string) => isWholeNumber(value[id], 0, STOCK_MAX))
  );
};

// Checks every field before the loaded data is used. Recipes and ingredients
// are taken from the game tables by id, so edited numbers in storage are ignored.
export const parseSave = (data: unknown): ISavedGame | null => {
  if (!isRecord(data) || !isDifficulty(data.difficulty) || !isSavedStatus(data.status)) {
    return null;
  }

  const { difficulty } = data;
  const settings: IDifficultySettings = getDifficultySettings(difficulty);
  const activeRecipe: IRecipe | undefined = findRecipe(data.activeRecipe, difficulty);

  if (
    !activeRecipe ||
    !isWholeNumber(data.score, 0, Number.MAX_SAFE_INTEGER) ||
    typeof data.timeLeft !== 'number' ||
    !Number.isFinite(data.timeLeft) ||
    data.timeLeft <= 0 ||
    data.timeLeft > secondsToMs(settings.startTimeSeconds) ||
    !isWholeNumber(data.lives, 1, settings.lives) ||
    !Array.isArray(data.cauldronIngredients) ||
    data.cauldronIngredients.length > settings.maxCauldronIngredients ||
    !isValidStock(data.shelfStock, difficulty)
  ) {
    return null;
  }

  const shelfIds: string[] = Object.keys(data.shelfStock);
  const cauldronIngredients: IIngredient[] = [];

  for (const item of data.cauldronIngredients) {
    const ingredient: IIngredient | undefined = toIngredient(item);

    if (!ingredient || !shelfIds.includes(ingredient.id)) {
      return null;
    }

    cauldronIngredients.push(ingredient);
  }

  return {
    difficulty,
    score: data.score,
    timeLeft: data.timeLeft,
    lives: data.lives,
    activeRecipe,
    cauldronIngredients,
    shelfStock: { ...data.shelfStock },
    status: data.status,
  };
};

export const isValidSave = (data: unknown): boolean => parseSave(data) !== null;

export const saveGame = (state: IGameState): boolean => {
  if (!isSavedStatus(state.status) || !state.activeRecipe) {
    return false;
  }

  const saved: ISavedGame = {
    difficulty: state.difficulty,
    score: state.score,
    timeLeft: state.timeLeft,
    lives: state.lives,
    activeRecipe: state.activeRecipe,
    cauldronIngredients: state.cauldronIngredients,
    shelfStock: state.shelfStock,
    status: state.status,
  };

  return writeJson(SAVE_KEY, saved);
};

export const clearSave = (): boolean => removeItem(SAVE_KEY);

// A broken save is deleted, so the game starts normally.
export const loadGame = (): ISavedGame | null => {
  const data: unknown = readJson(SAVE_KEY);

  if (data === null) {
    return null;
  }

  const saved: ISavedGame | null = parseSave(data);

  if (!saved) {
    clearSave();
  }

  return saved;
};
