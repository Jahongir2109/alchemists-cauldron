export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'game-over';

export type CauldronParameter = 'temperature' | 'density' | 'magicPower';

export type GameOverReason = 'time' | 'lives' | 'ingredients';

export type BrewResult = 'success' | 'failure';

export interface ICauldronValues {
  temperature: number;
  density: number;
  magicPower: number;
}

export interface IIngredient extends ICauldronValues {
  id: string;
  name: string;
  icon: string;
}

export interface IRecipeRange {
  min: number;
  max: number;
}

export interface IRecipe {
  id: string;
  name: string;
  difficulty: Difficulty;
  temperature: IRecipeRange;
  density: IRecipeRange;
  magicPower: IRecipeRange;
}

export interface IDifficultySettings {
  shelfSize: number;
  maxCauldronIngredients: number;
  startTimeSeconds: number;
  tolerance: number;
  lives: number;
  scorePerBrew: number;
  timeBonusSeconds: number;
  reactionCount: number;
}

export type ShelfStock = Record<string, number>;

export type ReactionDifficulty = Exclude<Difficulty, 'easy'>;

// One-time side effects: they happen only at the moment the reaction fires.
export interface IReactionEffects {
  timePenaltySeconds?: number;
  lifePenalty?: number;
  clearsCauldron?: boolean;
}

export interface IReaction {
  id: string;
  name: string;
  description: string;
  difficulty: ReactionDifficulty;
  isActive: (ingredients: readonly IIngredient[]) => boolean;
  apply: (values: ICauldronValues) => ICauldronValues;
  effects?: IReactionEffects;
}

export interface IGameState {
  status: GameStatus;
  difficulty: Difficulty;
  score: number;
  timeLeft: number; // milliseconds
  lives: number;
  activeRecipe: IRecipe | null;
  cauldronIngredients: IIngredient[];
  shelfStock: ShelfStock;
  gameOverReason: GameOverReason | null;
  lastBrewResult: BrewResult | null;
  lastReactionId: string | null;
}

export interface ILeaderboardEntry {
  name: string;
  score: number;
  date: number; // timestamp from Date.now()
  difficulty: Difficulty;
}
