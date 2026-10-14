import type { CauldronParameter, ICauldronValues, IRecipe, IRecipeRange } from '../types/game';

export const CAULDRON_PARAMETERS: readonly CauldronParameter[] = [
  'temperature',
  'density',
  'magicPower',
];

export type ParameterCheck = Record<CauldronParameter, boolean>;

export interface IBrewCheck {
  isSuccess: boolean;
  parameters: ParameterCheck;
}

export const expandRange = (range: IRecipeRange, tolerance: number): IRecipeRange => ({
  min: range.min - tolerance,
  max: range.max + tolerance,
});

export const isInRange = (value: number, range: IRecipeRange): boolean =>
  value >= range.min && value <= range.max;

export const getCheckedRange = (
  recipe: IRecipe,
  parameter: CauldronParameter,
  tolerance: number,
): IRecipeRange => expandRange(recipe[parameter], tolerance);

export const checkParameters = (
  values: ICauldronValues,
  recipe: IRecipe,
  tolerance: number,
): ParameterCheck => ({
  temperature: isInRange(values.temperature, getCheckedRange(recipe, 'temperature', tolerance)),
  density: isInRange(values.density, getCheckedRange(recipe, 'density', tolerance)),
  magicPower: isInRange(values.magicPower, getCheckedRange(recipe, 'magicPower', tolerance)),
});

export const checkBrew = (
  values: ICauldronValues,
  recipe: IRecipe,
  tolerance: number,
): IBrewCheck => {
  const parameters: ParameterCheck = checkParameters(values, recipe, tolerance);

  return {
    isSuccess: CAULDRON_PARAMETERS.every((parameter: CauldronParameter) => parameters[parameter]),
    parameters,
  };
};
