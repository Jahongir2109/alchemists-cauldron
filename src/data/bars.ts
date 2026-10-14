import type { CauldronParameter, IRecipeRange } from '../types/game';

export interface IBarConfig {
  parameter: CauldronParameter;
  label: string;
  icon: string;
  scale: IRecipeRange;
}

// Temperature and Density can go below 0, so their scale is symmetric
// and the center line means 0. Magic Power never goes below 0.
export const BARS: readonly IBarConfig[] = [
  {
    parameter: 'temperature',
    label: 'Temperature',
    icon: 'param-temperature',
    scale: { min: -100, max: 100 },
  },
  {
    parameter: 'density',
    label: 'Density',
    icon: 'param-density',
    scale: { min: -100, max: 100 },
  },
  {
    parameter: 'magicPower',
    label: 'Magic Power',
    icon: 'param-magic',
    scale: { min: 0, max: 150 },
  },
];
