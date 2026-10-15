import { calculateCauldron } from '../logic/calculate-cauldron';
import type { ICauldronValues, IIngredient, IReaction, ReactionDifficulty } from '../types/game';

// Reactions change values by percents; the cauldron always shows whole numbers.
const percent = (value: number, change: number): number =>
  Math.round((value * (100 + change)) / 100);

const hasAll =
  (...ids: readonly string[]) =>
  (ingredients: readonly IIngredient[]): boolean =>
    ids.every((id: string) => ingredients.some((ingredient: IIngredient) => ingredient.id === id));

const totals = (ingredients: readonly IIngredient[]): ICauldronValues =>
  calculateCauldron(ingredients);

const hasHotAndCold = (ingredients: readonly IIngredient[]): boolean =>
  ingredients.some((ingredient: IIngredient) => ingredient.temperature > 15) &&
  ingredients.some((ingredient: IIngredient) => ingredient.temperature < -15);

// The full reaction catalog from US 3.3. Every difficulty enables only its own subset.
export const REACTIONS: readonly IReaction[] = [
  {
    id: 'bubbling',
    name: 'Bubbling',
    description: 'Fairy Dust + Caustic Acid: Magic Power +50%, −10 s',
    difficulty: 'medium',
    isActive: hasAll('fairy-dust', 'caustic-acid'),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      magicPower: percent(values.magicPower, 50),
    }),
    effects: { timePenaltySeconds: 10 },
  },
  {
    id: 'volatile-mix',
    name: 'Volatile Mix',
    description: 'Phoenix Feather + Essence of the Void: −1 life, the cauldron is cleared',
    difficulty: 'hard',
    isActive: hasAll('phoenix-feather', 'void-essence'),
    apply: (values: ICauldronValues): ICauldronValues => values,
    effects: { lifePenalty: 1, clearsCauldron: true },
  },
  {
    id: 'solar-frost',
    name: 'Solar Frost',
    description: 'Dragon Tears + Frost Lotus: Temperature = 0, Density +20%',
    difficulty: 'medium',
    isActive: hasAll('dragon-tears', 'frost-lotus'),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: 0,
      density: percent(values.density, 20),
    }),
  },
  {
    id: 'rooted-steam',
    name: 'Rooted Steam',
    description: 'Mandrake Root + Toad Slime: Density +25%, Magic Power −10%',
    difficulty: 'hard',
    isActive: hasAll('mandrake-root', 'toad-slime'),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      density: percent(values.density, 25),
      magicPower: percent(values.magicPower, -10),
    }),
  },
  {
    id: 'ashen-bloom',
    name: 'Ashen Bloom',
    description: 'Phoenix Feather + Fairy Dust: Temperature +10, Magic Power +25%',
    difficulty: 'hard',
    isActive: hasAll('phoenix-feather', 'fairy-dust'),
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: values.temperature + 10,
      magicPower: percent(values.magicPower, 25),
    }),
  },
  {
    id: 'annihilation',
    name: 'Annihilation',
    description: 'Temperature > +15 and < −15 in one mix: Temperature = 0, Density ×2',
    difficulty: 'hard',
    isActive: hasHotAndCold,
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: 0,
      density: values.density * 2,
    }),
  },
  {
    id: 'pressure-spike',
    name: 'Pressure Spike',
    description: 'Total Density ≥ 70: Density = 70, Magic Power +10%',
    difficulty: 'hard',
    isActive: (ingredients: readonly IIngredient[]): boolean => totals(ingredients).density >= 70,
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      density: 70,
      magicPower: percent(values.magicPower, 10),
    }),
  },
  {
    id: 'magma-flux',
    name: 'Magma Flux',
    description: 'Total Temperature ≥ 60: Magic Power +20%, Density −10%',
    difficulty: 'hard',
    isActive: (ingredients: readonly IIngredient[]): boolean =>
      totals(ingredients).temperature >= 60,
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      magicPower: percent(values.magicPower, 20),
      density: percent(values.density, -10),
    }),
  },
  {
    id: 'deep-freeze',
    name: 'Deep Freeze',
    description: 'Total Temperature ≤ −20: Density +15%, Magic Power −15%',
    difficulty: 'hard',
    isActive: (ingredients: readonly IIngredient[]): boolean =>
      ingredients.length > 0 && totals(ingredients).temperature <= -20,
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      density: percent(values.density, 15),
      magicPower: percent(values.magicPower, -15),
    }),
  },
  {
    id: 'arcane-saturation',
    name: 'Arcane Saturation',
    description: 'Total Magic Power ≥ 80: Magic Power = 80, Temperature +5',
    difficulty: 'hard',
    isActive: (ingredients: readonly IIngredient[]): boolean =>
      totals(ingredients).magicPower >= 80,
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      magicPower: 80,
      temperature: values.temperature + 5,
    }),
  },
  {
    id: 'steam-burst',
    name: 'Steam Burst',
    description: 'Dragon Tears + Caustic Acid, Temperature ≥ 35: Temperature +10, −5 s',
    difficulty: 'hard',
    isActive: (ingredients: readonly IIngredient[]): boolean =>
      hasAll('dragon-tears', 'caustic-acid')(ingredients) && totals(ingredients).temperature >= 35,
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: values.temperature + 10,
    }),
    effects: { timePenaltySeconds: 5 },
  },
  {
    id: 'black-ice',
    name: 'Black Ice',
    description:
      'Frost Lotus + Essence of the Void, Density ≤ 0: Temperature −10, Magic Power +20%',
    difficulty: 'hard',
    isActive: (ingredients: readonly IIngredient[]): boolean =>
      hasAll('frost-lotus', 'void-essence')(ingredients) && totals(ingredients).density <= 0,
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: values.temperature - 10,
      magicPower: percent(values.magicPower, 20),
    }),
  },
  {
    id: 'heavy-spark',
    name: 'Heavy Spark',
    description: 'Fairy Dust + Toad Slime, Density ≥ 40: Density +20%, Magic Power +10%',
    difficulty: 'hard',
    isActive: (ingredients: readonly IIngredient[]): boolean =>
      hasAll('fairy-dust', 'toad-slime')(ingredients) && totals(ingredients).density >= 40,
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      density: percent(values.density, 20),
      magicPower: percent(values.magicPower, 10),
    }),
  },
  {
    id: 'burning-root',
    name: 'Burning Root',
    description: 'Mandrake Root + Phoenix Feather, Temperature ≥ 40: Temperature +15, Density −10%',
    difficulty: 'hard',
    isActive: (ingredients: readonly IIngredient[]): boolean =>
      hasAll('mandrake-root', 'phoenix-feather')(ingredients) &&
      totals(ingredients).temperature >= 40,
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      temperature: values.temperature + 15,
      density: percent(values.density, -10),
    }),
  },
  {
    id: 'void-resonance',
    name: 'Void Resonance',
    description:
      'Essence of the Void + Dragon Tears, Magic Power ≥ 50: Magic Power +30%, Temperature −5',
    difficulty: 'hard',
    isActive: (ingredients: readonly IIngredient[]): boolean =>
      hasAll('void-essence', 'dragon-tears')(ingredients) && totals(ingredients).magicPower >= 50,
    apply: (values: ICauldronValues): ICauldronValues => ({
      ...values,
      magicPower: percent(values.magicPower, 30),
      temperature: values.temperature - 5,
    }),
  },
];

// Which reactions each difficulty enables (Easy has none). The list size
// matches the "Reactions" row of the difficulty table.
export const ENABLED_REACTIONS: Readonly<Record<ReactionDifficulty, readonly string[]>> = {
  medium: ['bubbling', 'solar-frost'],
  hard: ['volatile-mix', 'rooted-steam', 'magma-flux'],
};

export const findReaction = (id: string): IReaction | undefined =>
  REACTIONS.find((reaction: IReaction) => reaction.id === id);
