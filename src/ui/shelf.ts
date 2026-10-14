import { getStock } from '../logic/stock';
import type { IIngredient, ShelfStock } from '../types/game';
import { createElement } from './dom';
import { formatSigned } from './format';
import { createIcon } from './icons';

interface IShelfCard {
  ingredient: IIngredient;
  button: HTMLButtonElement;
  badge: HTMLSpanElement;
}

export interface IShelfViewState {
  ingredients: readonly IIngredient[];
  stock: ShelfStock;
  isBlocked: boolean;
}

const createStat = (label: string, value: number, modifier: string): HTMLSpanElement =>
  createElement('span', {
    className: `stat stat--${modifier}`,
    text: `${label}${formatSigned(value)}`,
  });

export class ShelfView {
  private readonly list: HTMLUListElement;

  private cards: IShelfCard[] = [];

  public constructor(
    container: HTMLElement,
    private readonly onAdd: (id: string) => void,
  ) {
    this.list = createElement('ul', {
      className: 'shelf__list',
      attributes: { 'aria-label': 'Ingredient shelf' },
    });
    container.append(this.list);
  }

  public render(view: IShelfViewState): void {
    if (!this.hasSameIngredients(view.ingredients)) {
      this.build(view.ingredients);
    }

    for (const card of this.cards) {
      this.updateCard(card, getStock(view.stock, card.ingredient.id), view.isBlocked);
    }
  }

  private hasSameIngredients(ingredients: readonly IIngredient[]): boolean {
    return (
      ingredients.length === this.cards.length &&
      ingredients.every(
        (ingredient: IIngredient, index: number) =>
          this.cards[index]?.ingredient.id === ingredient.id,
      )
    );
  }

  private build(ingredients: readonly IIngredient[]): void {
    this.cards = ingredients.map((ingredient: IIngredient) => this.createCard(ingredient));
    this.list.replaceChildren(
      ...this.cards.map((card: IShelfCard) =>
        createElement('li', { className: 'shelf__item' }, [card.button]),
      ),
    );
  }

  private createCard(ingredient: IIngredient): IShelfCard {
    const badge: HTMLSpanElement = createElement('span', { className: 'ingredient__stock' });
    const button: HTMLButtonElement = createElement(
      'button',
      { className: 'ingredient', attributes: { type: 'button', 'data-id': ingredient.id } },
      [
        createIcon(ingredient.icon, 'ingredient__icon'),
        createElement('span', { className: 'ingredient__name', text: ingredient.name }),
        createElement('span', { className: 'ingredient__stats' }, [
          createStat('T', ingredient.temperature, 'temperature'),
          createStat('D', ingredient.density, 'density'),
          createStat('MP', ingredient.magicPower, 'magic'),
        ]),
        badge,
      ],
    );

    button.addEventListener('click', () => {
      this.onAdd(ingredient.id);
    });

    return { ingredient, button, badge };
  }

  private updateCard(card: IShelfCard, stock: number, isBlocked: boolean): void {
    const isEmpty: boolean = stock <= 0;

    card.badge.textContent = String(stock);
    card.button.disabled = isEmpty || isBlocked;
    card.button.classList.toggle('is-empty', isEmpty);
    card.button.setAttribute(
      'aria-label',
      isEmpty
        ? `${card.ingredient.name}: out of stock`
        : `Add ${card.ingredient.name}, ${String(stock)} left`,
    );
  }
}
