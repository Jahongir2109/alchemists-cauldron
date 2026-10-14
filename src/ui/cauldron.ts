import type { IIngredient } from '../types/game';
import { createElement } from './dom';
import { createIcon } from './icons';

export interface ICauldronViewState {
  ingredients: readonly IIngredient[];
  capacity: number;
}

export class CauldronView {
  private readonly list: HTMLOListElement;

  public constructor(container: HTMLElement) {
    const pot: HTMLDivElement = createElement('div', { className: 'cauldron__pot' }, [
      createElement('div', { className: 'cauldron__steam' }),
      createElement('div', { className: 'cauldron__rim' }),
      createElement('div', { className: 'cauldron__body' }, [
        createElement('div', { className: 'cauldron__liquid' }),
        createElement('span', { className: 'cauldron__bubble cauldron__bubble--1' }),
        createElement('span', { className: 'cauldron__bubble cauldron__bubble--2' }),
        createElement('span', { className: 'cauldron__bubble cauldron__bubble--3' }),
      ]),
      createElement('div', { className: 'cauldron__legs' }),
    ]);

    this.list = createElement('ol', {
      className: 'cauldron__list',
      attributes: { 'aria-label': 'Ingredients in the cauldron', 'aria-live': 'polite' },
    });

    container.append(pot, this.list);
  }

  public render(view: ICauldronViewState): void {
    const items: HTMLLIElement[] = view.ingredients.map((ingredient: IIngredient) =>
      createElement('li', { className: 'cauldron__item', attributes: { title: ingredient.name } }, [
        createIcon(ingredient.icon, 'cauldron__item-icon'),
        createElement('span', { className: 'visually-hidden', text: ingredient.name }),
      ]),
    );

    const emptySlots: HTMLLIElement[] = Array.from(
      { length: Math.max(0, view.capacity - view.ingredients.length) },
      () =>
        createElement('li', {
          className: 'cauldron__item cauldron__item--empty',
          attributes: { 'aria-hidden': 'true' },
        }),
    );

    this.list.replaceChildren(...items, ...emptySlots);
  }
}
