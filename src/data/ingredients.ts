import type { IIngredient } from '../types/game';

// Fixed ordered catalogue from the task README. Easy uses the first 4,
// Medium (Level 1) the first 6 and Hard all 8 entries.
export const INGREDIENTS: readonly IIngredient[] = [
  {
    id: 'dragon-tears',
    name: 'Dragon Tears',
    icon: 'dragon-tears',
    temperature: 25,
    density: 8,
    magicPower: 10,
  },
  {
    id: 'fairy-dust',
    name: 'Fairy Dust',
    icon: 'fairy-dust',
    temperature: 12,
    density: 9,
    magicPower: 12,
  },
  {
    id: 'frost-lotus',
    name: 'Frost Lotus',
    icon: 'frost-lotus',
    temperature: -18,
    density: 4,
    magicPower: 14,
  },
  {
    id: 'mandrake-root',
    name: 'Mandrake Root',
    icon: 'mandrake-root',
    temperature: -5,
    density: 20,
    magicPower: 8,
  },
  {
    id: 'caustic-acid',
    name: 'Caustic Acid',
    icon: 'caustic-acid',
    temperature: 10,
    density: 14,
    magicPower: 22,
  },
  {
    id: 'void-essence',
    name: 'Essence of the Void',
    icon: 'void-essence',
    temperature: -20,
    density: -10,
    magicPower: 40,
  },
  {
    id: 'phoenix-feather',
    name: 'Phoenix Feather',
    icon: 'phoenix-feather',
    temperature: 50,
    density: -10,
    magicPower: 30,
  },
  {
    id: 'toad-slime',
    name: 'Toad Slime',
    icon: 'toad-slime',
    temperature: 5,
    density: 30,
    magicPower: 0,
  },
];

export const getShelfIngredients = (shelfSize: number): IIngredient[] =>
  INGREDIENTS.slice(0, shelfSize);

export const findIngredient = (id: string): IIngredient | undefined =>
  INGREDIENTS.find((ingredient: IIngredient) => ingredient.id === id);
