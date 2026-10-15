import type { Difficulty, ILeaderboardEntry } from '../types/game';

export const LEADERBOARD_SIZE = 10;

export const PLAYER_NAME_MIN_LENGTH = 2;
export const PLAYER_NAME_MAX_LENGTH = 15;

// Letters (any alphabet), digits, space, "_" and "-".
const PLAYER_NAME_PATTERN = /^[\p{L}\d _-]+$/u;

export const normalizePlayerName = (name: string): string => name.trim();

export const isValidPlayerName = (name: string): boolean => {
  const normalized: string = normalizePlayerName(name);

  return (
    normalized.length >= PLAYER_NAME_MIN_LENGTH &&
    normalized.length <= PLAYER_NAME_MAX_LENGTH &&
    PLAYER_NAME_PATTERN.test(normalized)
  );
};

// Higher score first. Equal scores keep the earlier result higher.
export const compareEntries = (first: ILeaderboardEntry, second: ILeaderboardEntry): number =>
  second.score - first.score || first.date - second.date;

export const sortLeaderboard = (entries: readonly ILeaderboardEntry[]): ILeaderboardEntry[] =>
  [...entries].sort(compareEntries).slice(0, LEADERBOARD_SIZE);

// One Top-10 list per difficulty.
export const getDifficultyBoard = (
  entries: readonly ILeaderboardEntry[],
  difficulty: Difficulty,
): ILeaderboardEntry[] =>
  sortLeaderboard(entries.filter((entry: ILeaderboardEntry) => entry.difficulty === difficulty));

// Keeps the Top-10 of every difficulty in one stored list.
export const trimLeaderboard = (entries: readonly ILeaderboardEntry[]): ILeaderboardEntry[] => {
  const difficulties: Difficulty[] = [
    ...new Set(entries.map((entry: ILeaderboardEntry) => entry.difficulty)),
  ];

  return difficulties.flatMap((difficulty: Difficulty) => getDifficultyBoard(entries, difficulty));
};

export const isTopScore = (
  entries: readonly ILeaderboardEntry[],
  score: number,
  difficulty: Difficulty,
): boolean => {
  if (score <= 0) {
    return false;
  }

  const sorted: ILeaderboardEntry[] = getDifficultyBoard(entries, difficulty);
  const last: ILeaderboardEntry | undefined = sorted[LEADERBOARD_SIZE - 1];

  // A new result is always later, so it must beat the 10th score, not tie it.
  return last === undefined || score > last.score;
};

export const addLeaderboardEntry = (
  entries: readonly ILeaderboardEntry[],
  entry: ILeaderboardEntry,
): ILeaderboardEntry[] => trimLeaderboard([...entries, entry]);

const pad = (value: number): string => String(value).padStart(2, '0');

// DD.MM.YYYY HH:MM in the player's local time.
export const formatLeaderboardDate = (timestamp: number): string => {
  const date: Date = new Date(timestamp);

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
