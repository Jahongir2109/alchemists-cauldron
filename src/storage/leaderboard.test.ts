import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clearLeaderboard, LEADERBOARD_KEY, loadLeaderboard, saveLeaderboard } from './leaderboard';

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

const throwingStorage = {
  getItem: (): never => {
    throw new Error('blocked');
  },
  setItem: (): never => {
    throw new Error('blocked');
  },
  removeItem: (): never => {
    throw new Error('blocked');
  },
};

const setStorage = (storage: unknown): void => {
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
};

describe('leaderboard storage', () => {
  beforeEach(() => {
    setStorage(new MemoryStorage());
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'localStorage');
  });

  it('saves and loads the entries', () => {
    saveLeaderboard([{ name: 'Merlin', score: 400, date: 1, difficulty: 'medium' }]);

    expect(loadLeaderboard()).toEqual([
      { name: 'Merlin', score: 400, date: 1, difficulty: 'medium' },
    ]);
  });

  it('returns an empty list for broken JSON', () => {
    localStorage.setItem(LEADERBOARD_KEY, '{not json');

    expect(loadLeaderboard()).toEqual([]);
  });

  it('returns an empty list when the data is not an array', () => {
    localStorage.setItem(LEADERBOARD_KEY, '{"name":"x"}');

    expect(loadLeaderboard()).toEqual([]);
  });

  it('skips broken rows', () => {
    localStorage.setItem(
      LEADERBOARD_KEY,
      JSON.stringify([
        { name: 'Merlin', score: 400, date: 1, difficulty: 'medium' },
        { name: 'x', score: 'many', date: 'today' },
        null,
        42,
      ]),
    );

    expect(loadLeaderboard()).toHaveLength(1);
  });

  it('clears the leaderboard', () => {
    saveLeaderboard([{ name: 'Merlin', score: 400, date: 1, difficulty: 'medium' }]);
    clearLeaderboard();

    expect(loadLeaderboard()).toEqual([]);
  });

  it('never throws when localStorage is blocked', () => {
    setStorage(throwingStorage);

    expect(loadLeaderboard()).toEqual([]);
    expect(saveLeaderboard([])).toBe(false);
    expect(clearLeaderboard()).toBe(false);
  });
});
