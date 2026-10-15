import type { IIngredient } from '../types/game';
import { createElement } from './dom';
import { createIcon } from './icons';
import { INGREDIENT_DRAG_TYPE } from './shelf';

export interface ICauldronViewState {
  ingredients: readonly IIngredient[];
  capacity: number;
}

export interface ICauldronDropZone {
  canDrop: () => boolean;
  onDrop: (id: string) => void;
}

const isIngredientDrag = (event: DragEvent): boolean =>
  event.dataTransfer?.types.includes(INGREDIENT_DRAG_TYPE) ?? false;

export class CauldronView {
  private readonly list: HTMLOListElement;

  public constructor(
    private readonly container: HTMLElement,
    private readonly dropZone: ICauldronDropZone,
  ) {
    this.listenToDrops();

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

  // Only a valid drag (an ingredient while the game runs and the cauldron has room) is accepted.
  private listenToDrops(): void {
    this.container.addEventListener('dragover', (event: DragEvent) => {
      if (!isIngredientDrag(event) || !this.dropZone.canDrop()) {
        this.setHighlight(false);

        return;
      }

      event.preventDefault();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }

      this.setHighlight(true);
    });

    this.container.addEventListener('dragleave', (event: DragEvent) => {
      if (!(event.relatedTarget instanceof Node) || !this.container.contains(event.relatedTarget)) {
        this.setHighlight(false);
      }
    });

    this.container.addEventListener('drop', (event: DragEvent) => {
      event.preventDefault();
      this.setHighlight(false);

      const id: string = event.dataTransfer?.getData(INGREDIENT_DRAG_TYPE) ?? '';

      if (id && this.dropZone.canDrop()) {
        this.dropZone.onDrop(id);
      }
    });
  }

  private setHighlight(isActive: boolean): void {
    this.container.classList.toggle('is-drop-target', isActive);
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
