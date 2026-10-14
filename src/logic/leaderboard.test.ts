import { describe, expect, it } from 'vitest';

import type { ILeaderboardEntry } from '../types/game';
import {
  addLeaderboardEntry,
  formatLeaderboardDate,
  isTopScore,
  isValidPlayerName,
  sortLeaderboard,
} from './leaderboard';

const entry = (name: string, score: number, date: number): ILeaderboardEntry => ({
  name,
  score,
  date,
  difficulty: 'medium',
});

const fullBoard: ILeaderboardEntry[] = Array.from({ length: 10 }, (_: unknown, index: number) =>
  entry(`P${String(index)}`, (index + 1) * 100, index),
);

describe('player name', () => {
  it('accepts 2–15 letters, digits, space, "_" and "-"', () => {
    expect(isValidPlayerName('Al')).toBe(true);
    expect(isValidPlayerName('Merlin_the-2nd')).toBe(true);
    expect(isValidPlayerName('Jon Snow')).toBe(true);
    expect(isValidPlayerName('Алхимик')).toBe(true);
  });

  it('rejects too short, too long and special characters', () => {
    expect(isValidPlayerName('A')).toBe(false);
    expect(isValidPlayerName('   ')).toBe(false);
    expect(isValidPlayerName('A'.repeat(16))).toBe(false);
    expect(isValidPlayerName('<script>')).toBe(false);
    expect(isValidPlayerName('name!')).toBe(false);
  });
});

describe('leaderboard order', () => {
  it('sorts by score from high to low', () => {
    const sorted = sortLeaderboard([entry('a', 100, 1), entry('b', 300, 2), entry('c', 200, 3)]);

    expect(sorted.map((item) => item.name)).toEqual(['b', 'c', 'a']);
  });

  it('keeps the earlier result higher on equal scores', () => {
    const sorted = sortLeaderboard([entry('later', 200, 20), entry('earlier', 200, 10)]);

    expect(sorted.map((item) => item.name)).toEqual(['earlier', 'later']);
  });

  it('keeps only the Top-10', () => {
    const board = addLeaderboardEntry(fullBoard, entry('new', 5000, 99));

    expect(board).toHaveLength(10);
    expect(board[0]?.name).toBe('new');
    expect(board.some((item) => item.score === 100)).toBe(false);
  });
});

describe('isTopScore', () => {
  it('accepts any positive score while the board has free places', () => {
    expect(isTopScore([], 200)).toBe(true);
    expect(isTopScore([], 0)).toBe(false);
  });

  it('must beat the 10th score on a full board, a tie is not enough', () => {
    expect(isTopScore(fullBoard, 101)).toBe(true);
    expect(isTopScore(fullBoard, 100)).toBe(false);
  });
});

describe('formatLeaderboardDate', () => {
  it('formats the date as DD.MM.YYYY HH:MM', () => {
    expect(formatLeaderboardDate(new Date(2026, 0, 5, 9, 7).getTime())).toBe('05.01.2026 09:07');
  });
});
