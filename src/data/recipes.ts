import type { Difficulty, IRecipe, IRecipeRange } from '../types/game';

const range = (min: number, max: number): IRecipeRange => ({ min, max });

const recipe = (
  id: string,
  name: string,
  difficulty: Difficulty,
  temperature: IRecipeRange,
  density: IRecipeRange,
  magicPower: IRecipeRange,
): IRecipe => ({ id, name, difficulty, temperature, density, magicPower });

// Fixed pool of 20 recipes from the task README.
export const RECIPES: readonly IRecipe[] = [
  recipe('moon-mist', 'Moon Mist', 'easy', range(32, 42), range(12, 22), range(17, 27)),
  recipe('root-bloom', 'Root Bloom', 'easy', range(2, 12), range(24, 34), range(15, 25)),
  recipe('frost-steam', 'Frost Steam', 'easy', range(2, 12), range(7, 17), range(19, 29)),
  recipe('quiet-swirl', 'Quiet Swirl', 'easy', range(-28, -18), range(19, 29), range(17, 27)),
  recipe('bright-dew', 'Bright Dew', 'easy', range(27, 37), range(32, 42), range(25, 35)),
  recipe('snow-dust', 'Snow Dust', 'easy', range(-16, -6), range(28, 38), range(29, 39)),
  recipe('acid-spark', 'Acid Spark', 'medium', range(17, 27), range(18, 28), range(29, 39)),
  recipe('void-ember', 'Void Ember', 'medium', range(0, 10), range(0, 10), range(45, 55)),
  recipe('heavy-acid', 'Heavy Acid', 'medium', range(0, 10), range(29, 39), range(25, 35)),
  recipe('frost-acid', 'Frost Acid', 'medium', range(-13, -3), range(13, 23), range(31, 41)),
  recipe('dusty-void', 'Dusty Void', 'medium', range(-13, -3), range(0, 10), range(47, 57)),
  recipe('dragon-void', 'Dragon Void', 'medium', range(25, 35), range(1, 11), range(55, 65)),
  recipe('rooted-night', 'Rooted Night', 'medium', range(-18, -8), range(14, 24), range(55, 65)),
  recipe('phoenix-pulse', 'Phoenix Pulse', 'hard', range(57, 67), range(0, 10), range(37, 47)),
  recipe('slime-crown', 'Slime Crown', 'hard', range(-5, 5), range(45, 55), range(3, 13)),
  recipe('void-flame', 'Void Flame', 'hard', range(25, 35), range(0, 10), range(60, 70)),
  recipe('acid-bog', 'Acid Bog', 'hard', range(10, 20), range(39, 49), range(17, 27)),
  recipe('frozen-ash', 'Frozen Ash', 'hard', range(27, 37), range(0, 10), range(39, 49)),
  recipe('triple-eclipse', 'Triple Eclipse', 'hard', range(-20, -10), range(19, 29), range(60, 70)),
  recipe('ember-soup', 'Ember Soup', 'hard', range(62, 72), range(24, 34), range(37, 47)),
];
