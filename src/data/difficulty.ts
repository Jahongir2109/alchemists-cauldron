import type { Difficulty, IDifficultySettings } from '../types/game';

// Single source of numbers: the difficulty table from the task README.
export const DIFFICULTY_SETTINGS: Readonly<Record<Difficulty, IDifficultySettings>> = {
  easy: {
    shelfSize: 4,
    maxCauldronIngredients: 4,
    startTimeSeconds: 180,
    tolerance: 12,
    lives: 5,
    scorePerBrew: 100,
    timeBonusSeconds: 15,
    reactionCount: 0,
  },
  medium: {
    shelfSize: 6,
    maxCauldronIngredients: 4,
    startTimeSeconds: 150,
    tolerance: 8,
    lives: 3,
    scorePerBrew: 200,
    timeBonusSeconds: 10,
    reactionCount: 2,
  },
  hard: {
    shelfSize: 8,
    maxCauldronIngredients: 5,
    startTimeSeconds: 150,
    tolerance: 5,
    lives: 3,
    scorePerBrew: 300,
    timeBonusSeconds: 5,
    reactionCount: 3,
  },
};

// Level 1 always plays with the Medium rules.
export const DEFAULT_DIFFICULTY: Difficulty = 'medium';

export const DIFFICULTY_LABELS: Readonly<Record<Difficulty, string>> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const getDifficultySettings = (difficulty: Difficulty): IDifficultySettings =>
  DIFFICULTY_SETTINGS[difficulty];
