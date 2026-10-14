import type { ICauldronValues, IIngredient } from '../types/game';

export const EMPTY_CAULDRON_VALUES: Readonly<ICauldronValues> = {
  temperature: 0,
  density: 0,
  magicPower: 0,
};

export const calculateCauldron = (ingredients: readonly IIngredient[]): ICauldronValues =>
  ingredients.reduce<ICauldronValues>(
    (total: ICauldronValues, ingredient: IIngredient) => ({
      temperature: total.temperature + ingredient.temperature,
      density: total.density + ingredient.density,
      magicPower: total.magicPower + ingredient.magicPower,
    }),
    { ...EMPTY_CAULDRON_VALUES },
  );
