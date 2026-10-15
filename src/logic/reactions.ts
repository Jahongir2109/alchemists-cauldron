import { ENABLED_REACTIONS, findReaction } from '../data/reactions';
import type { Difficulty, ICauldronValues, IIngredient, IReaction } from '../types/game';
import { calculateCauldron } from './calculate-cauldron';

export const getReactions = (difficulty: Difficulty): IReaction[] => {
  if (difficulty === 'easy') {
    return [];
  }

  return ENABLED_REACTIONS[difficulty]
    .map((id: string) => findReaction(id))
    .filter((reaction: IReaction | undefined): reaction is IReaction => reaction !== undefined);
};

export const getActiveReactions = (
  ingredients: readonly IIngredient[],
  reactions: readonly IReaction[],
): IReaction[] => reactions.filter((reaction: IReaction) => reaction.isActive(ingredients));

// Always recalculated from the ingredient list: base sums first, then every
// reaction that is active for this list changes the current values.
export const calculateMixture = (
  ingredients: readonly IIngredient[],
  reactions: readonly IReaction[],
): ICauldronValues =>
  getActiveReactions(ingredients, reactions).reduce<ICauldronValues>(
    (values: ICauldronValues, reaction: IReaction) => reaction.apply(values),
    calculateCauldron(ingredients),
  );

// A reaction fires only when it changes from "not active" to "active".
export const getFiredReactions = (
  before: readonly IIngredient[],
  after: readonly IIngredient[],
  reactions: readonly IReaction[],
): IReaction[] =>
  reactions.filter((reaction: IReaction) => !reaction.isActive(before) && reaction.isActive(after));
