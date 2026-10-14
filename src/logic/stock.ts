import type { IIngredient, ShelfStock } from '../types/game';
import { randomInt } from './random';
import type { RandomSource } from './random';

export const STOCK_MIN = 2;
export const STOCK_MAX = 15;

export const createStock = (
  ingredients: readonly IIngredient[],
  random: RandomSource = Math.random,
): ShelfStock => {
  const stock: ShelfStock = {};

  for (const ingredient of ingredients) {
    stock[ingredient.id] = randomInt(STOCK_MIN, STOCK_MAX, random);
  }

  return stock;
};

export const getStock = (stock: ShelfStock, id: string): number => stock[id] ?? 0;

export const hasStock = (stock: ShelfStock, id: string): boolean => getStock(stock, id) > 0;

export const takeFromStock = (stock: ShelfStock, id: string): ShelfStock => {
  if (!hasStock(stock, id)) {
    return stock;
  }

  return { ...stock, [id]: getStock(stock, id) - 1 };
};

export const isShelfEmpty = (stock: ShelfStock): boolean =>
  Object.values(stock).every((portions: number) => portions <= 0);
