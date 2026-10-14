// A random source returns a number in [0, 1), like Math.random.
// Passing it in keeps the game rules testable.
export type RandomSource = () => number;

export const randomInt = (min: number, max: number, random: RandomSource = Math.random): number =>
  Math.floor(random() * (max - min + 1)) + min;

export const pickRandom = <T>(items: readonly T[], random: RandomSource = Math.random): T => {
  const item: T | undefined = items[Math.floor(random() * items.length)];

  if (item === undefined) {
    throw new Error('Cannot pick from an empty list');
  }

  return item;
};
