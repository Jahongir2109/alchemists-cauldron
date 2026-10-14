import { RECIPES } from '../data/recipes';
import type { Difficulty, IRecipe } from '../types/game';
import { pickRandom } from './random';
import type { RandomSource } from './random';

export const getRecipesByDifficulty = (difficulty: Difficulty): IRecipe[] =>
  RECIPES.filter((recipe: IRecipe) => recipe.difficulty === difficulty);

export const pickRecipe = (difficulty: Difficulty, random: RandomSource = Math.random): IRecipe =>
  pickRandom(getRecipesByDifficulty(difficulty), random);
