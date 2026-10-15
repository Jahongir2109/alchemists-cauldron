import { getStock } from '../logic/stock';
import type { IIngredient, ShelfStock } from '../types/game';
import { createElement } from './dom';
import { formatSigned } from './format';
import { createIcon } from './icons';

export const INGREDIENT_DRAG_TYPE = 'application/x-alchemy-ingredient';

interface IShelfCard {
  ingredient: IIngredient;
  button: HTMLButtonElement;
  badge: HTMLSpanElement;
  tooltip: HTMLDivElement;
}

export interface IShelfViewState {
  ingredients: readonly IIngredient[];
  stock: ShelfStock;
  isBlocked: boolean;
}

// Distance from the screen edge that makes the tooltip open to the other side.
const TOOLTIP_EDGE_GAP = 16;

const createTooltipRow = (label: string, value: number, modifier: string): HTMLDivElement =>
  createElement('div', { className: `tooltip__row tooltip__row--${modifier}` }, [
    createElement('dt', { className: 'tooltip__label', text: label }),
    createElement('dd', { className: 'tooltip__value', text: formatSigned(value) }),
  ]);

// Level 3: the numbers live in a tooltip, the card shows only the icon and the name.
const createTooltip = (ingredient: IIngredient): HTMLDivElement =>
  createElement(
    'div',
    {
      className: 'tooltip',
      attributes: { role: 'tooltip', id: `tooltip-${ingredient.id}` },
    },
    [
      createElement('p', { className: 'tooltip__title', text: ingredient.name }),
      createElement('dl', { className: 'tooltip__list' }, [
        createTooltipRow('Temperature', ingredient.temperature, 'temperature'),
        createTooltipRow('Density', ingredient.density, 'density'),
        createTooltipRow('Magic Power', ingredient.magicPower, 'magic'),
      ]),
    ],
  );

// Opens the tooltip to the left near the right edge and upward near the bottom edge.
const placeTooltip = (item: HTMLElement, tooltip: HTMLElement): void => {
  const card: DOMRect = item.getBoundingClientRect();
  const box: DOMRect = tooltip.getBoundingClientRect();
  const { clientWidth, clientHeight } = document.documentElement;
  const isNearRightEdge: boolean = card.right + box.width + TOOLTIP_EDGE_GAP > clientWidth;
  const fitsLeft: boolean = card.left - box.width - TOOLTIP_EDGE_GAP >= 0;
  // Narrow screens: no room on either side, so the tooltip opens over or under the card.
  const isStacked: boolean = isNearRightEdge && !fitsLeft;
  const height: number = isStacked ? card.height + box.height : box.height;

  tooltip.classList.toggle(
    'tooltip--left',
    isStacked ? card.left + box.width + TOOLTIP_EDGE_GAP > clientWidth : isNearRightEdge,
  );
  tooltip.classList.toggle('tooltip--stacked', isStacked);
  tooltip.classList.toggle('tooltip--up', card.top + height + TOOLTIP_EDGE_GAP > clientHeight);
};

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
      ...this.cards.map((card: IShelfCard) => {
        const item: HTMLLIElement = createElement('li', { className: 'shelf__item' }, [
          card.button,
          card.tooltip,
        ]);
        const place = (): void => {
          placeTooltip(item, card.tooltip);
        };

        // The list item, not the button, listens: a disabled button gets no mouse events.
        item.addEventListener('mouseenter', place);
        item.addEventListener('focusin', place);

        return item;
      }),
    );
  }

  private createCard(ingredient: IIngredient): IShelfCard {
    const badge: HTMLSpanElement = createElement('span', { className: 'ingredient__stock' });
    const tooltip: HTMLDivElement = createTooltip(ingredient);
    const button: HTMLButtonElement = createElement(
      'button',
      {
        className: 'ingredient',
        attributes: {
          type: 'button',
          'data-id': ingredient.id,
          'aria-describedby': tooltip.id,
        },
      },
      [
        createIcon(ingredient.icon, 'ingredient__icon'),
        createElement('span', { className: 'ingredient__name', text: ingredient.name }),
        badge,
      ],
    );

    button.addEventListener('click', () => {
      this.onAdd(ingredient.id);
    });

    // Drag & drop: the ingredient id travels in dataTransfer.
    button.addEventListener('dragstart', (event: DragEvent) => {
      if (button.disabled || !event.dataTransfer) {
        event.preventDefault();

        return;
      }

      event.dataTransfer.setData(INGREDIENT_DRAG_TYPE, ingredient.id);
      event.dataTransfer.setData('text/plain', ingredient.id);
      event.dataTransfer.effectAllowed = 'copy';
      button.classList.add('is-dragging');
    });

    button.addEventListener('dragend', () => {
      button.classList.remove('is-dragging');
    });

    return { ingredient, button, badge, tooltip };
  }

  private updateCard(card: IShelfCard, stock: number, isBlocked: boolean): void {
    const isEmpty: boolean = stock <= 0;

    card.badge.textContent = String(stock);
    card.button.disabled = isEmpty || isBlocked;
    // An empty ingredient (stock 0) can never be dragged.
    card.button.draggable = !card.button.disabled;
    card.button.classList.toggle('is-empty', isEmpty);
    card.button.setAttribute(
      'aria-label',
      isEmpty
        ? `${card.ingredient.name}: out of stock`
        : `Add ${card.ingredient.name}, ${String(stock)} left`,
    );
  }
}
