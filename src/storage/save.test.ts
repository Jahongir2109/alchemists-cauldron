import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { addIngredient, pauseGame, restoreGame, startGame } from '../state/game-state';
import type { IGameState } from '../types/game';
import { clearSave, isValidSave, loadGame, SAVE_KEY, saveGame } from './save';

class MemoryStorage {
  private readonly data = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  public removeItem(key: string): void {
    this.data.delete(key);
  }
}

const setStorage = (storage: unknown): void => {
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
};

const createRun = (): IGameState => {
  const state: IGameState = startGame('hard');

  return addIngredient({ ...state, score: 600, timeLeft: 90_500, lives: 2 }, 'toad-slime');
};

const storedSave = (): Record<string, unknown> => {
  const raw: string | null = localStorage.getItem(SAVE_KEY);

  return raw === null ? {} : (JSON.parse(raw) as Record<string, unknown>);
};

describe('save and continue', () => {
  beforeEach(() => {
    setStorage(new MemoryStorage());
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'localStorage');
  });

  it('saves the run and restores it paused with the same stock', () => {
    const run: IGameState = createRun();

    expect(saveGame(run)).toBe(true);

    const saved = loadGame();

    expect(saved).not.toBeNull();

    if (!saved) {
      return;
    }

    const restored: IGameState = restoreGame(saved);

    expect(restored.status).toBe('paused');
    expect(restored.difficulty).toBe('hard');
    expect(restored.score).toBe(600);
    expect(restored.timeLeft).toBe(90_500);
    expect(restored.lives).toBe(2);
    expect(restored.activeRecipe).toEqual(run.activeRecipe);
    expect(restored.cauldronIngredients.map((item) => item.id)).toEqual(['toad-slime']);
    expect(restored.shelfStock).toEqual(run.shelfStock);
  });

  it('saves a paused run too', () => {
    saveGame(pauseGame(createRun()));

    expect(storedSave().status).toBe('paused');
  });

  it('never saves a finished game or the start screen', () => {
    expect(saveGame({ ...createRun(), status: 'game-over' })).toBe(false);
    expect(loadGame()).toBeNull();
  });

  it('clears the save', () => {
    saveGame(createRun());
    clearSave();

    expect(loadGame()).toBeNull();
  });

  it('deletes broken JSON instead of crashing', () => {
    localStorage.setItem(SAVE_KEY, '{oops');

    expect(loadGame()).toBeNull();
  });

  it('rejects and deletes invalid saved data', () => {
    saveGame(createRun());

    const broken: Record<string, unknown>[] = [
      { ...storedSave(), difficulty: 'impossible' },
      { ...storedSave(), status: 'game-over' },
      { ...storedSave(), lives: 0 },
      { ...storedSave(), timeLeft: -5 },
      { ...storedSave(), score: 'many' },
      { ...storedSave(), activeRecipe: { id: 'moon-mist' } },
      { ...storedSave(), cauldronIngredients: [{ id: 'unknown' }] },
      { ...storedSave(), shelfStock: { 'dragon-tears': 3 } },
    ];

    for (const data of broken) {
      expect(isValidSave(data)).toBe(false);
    }

    localStorage.setItem(SAVE_KEY, JSON.stringify(broken[0]));

    expect(loadGame()).toBeNull();
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('never throws when localStorage is blocked', () => {
    setStorage({
      getItem: (): never => {
        throw new Error('blocked');
      },
      setItem: (): never => {
        throw new Error('blocked');
      },
      removeItem: (): never => {
        throw new Error('blocked');
      },
    });

    expect(saveGame(createRun())).toBe(false);
    expect(loadGame()).toBeNull();
    expect(clearSave()).toBe(false);
  });
});
