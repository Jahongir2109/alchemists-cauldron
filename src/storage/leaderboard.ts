import { isValidPlayerName, trimLeaderboard } from '../logic/leaderboard';
import type { Difficulty, ILeaderboardEntry } from '../types/game';
import { readJson, removeItem, writeJson } from './safe-storage';

export const LEADERBOARD_KEY = 'alchemists-cauldron:leaderboard';

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isDifficulty = (value: unknown): value is Difficulty =>
  typeof value === 'string' && DIFFICULTIES.some((item: Difficulty) => item === value);

export const isLeaderboardEntry = (value: unknown): value is ILeaderboardEntry =>
  isRecord(value) &&
  typeof value.name === 'string' &&
  isValidPlayerName(value.name) &&
  typeof value.score === 'number' &&
  Number.isFinite(value.score) &&
  value.score >= 0 &&
  typeof value.date === 'number' &&
  Number.isFinite(value.date) &&
  isDifficulty(value.difficulty);

// Broken or missing data gives an empty list; single broken rows are skipped.
export const loadLeaderboard = (): ILeaderboardEntry[] => {
  const data: unknown = readJson(LEADERBOARD_KEY);

  if (!Array.isArray(data)) {
    return [];
  }

  return trimLeaderboard(data.filter((item: unknown) => isLeaderboardEntry(item)));
};

export const saveLeaderboard = (entries: readonly ILeaderboardEntry[]): boolean =>
  writeJson(LEADERBOARD_KEY, trimLeaderboard(entries));

export const clearLeaderboard = (): boolean => removeItem(LEADERBOARD_KEY);
