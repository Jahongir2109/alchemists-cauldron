import { BARS } from '../data/bars';
import type { IBarConfig } from '../data/bars';
import { DIFFICULTY_LABELS } from '../data/difficulty';
import type { Difficulty, IRecipe, IRecipeRange } from '../types/game';
import { createElement } from './dom';
import { formatNumber } from './format';
import { createIcon } from './icons';

export interface IRecipeViewState {
  recipe: IRecipe | null;
  difficulty: Difficulty;
  added: number;
  capacity: number;
  tolerance: number;
}

interface IRangeRow {
  config: IBarConfig;
  value: HTMLSpanElement;
}

const formatRange = (range: IRecipeRange): string =>
  `${formatNumber(range.min)}..${formatNumber(range.max)}`;

export class RecipePanelView {
  private readonly name: HTMLHeadingElement;

  private readonly counter: HTMLParagraphElement;

  private readonly tolerance: HTMLParagraphElement;

  private readonly rows: IRangeRow[];

  public constructor(container: HTMLElement) {
    this.name = createElement('h3', { className: 'recipe__name' });
    this.counter = createElement('p', {
      className: 'recipe__counter',
      attributes: { 'aria-live': 'polite' },
    });
    this.tolerance = createElement('p', { className: 'recipe__tolerance' });

    this.rows = BARS.map((config: IBarConfig) => ({
      config,
      value: createElement('span', { className: 'recipe__range-value' }),
    }));

    const list: HTMLDListElement = createElement(
      'dl',
      { className: 'recipe__ranges' },
      this.rows.map((row: IRangeRow) =>
        createElement(
          'div',
          { className: `recipe__range recipe__range--${row.config.parameter}` },
          [
            createElement('dt', { className: 'recipe__range-label' }, [
              createIcon(row.config.icon, 'recipe__range-icon'),
              createElement('span', { text: row.config.label }),
            ]),
            createElement('dd', {}, [row.value]),
          ],
        ),
      ),
    );

    container.append(this.name, this.counter, list, this.tolerance);
  }

  public render(view: IRecipeViewState): void {
    this.counter.textContent = `Ingredients: ${String(view.added)} / ${String(view.capacity)}`;
    this.counter.classList.toggle('is-full', view.capacity > 0 && view.added >= view.capacity);

    if (!view.recipe) {
      this.name.textContent = 'No recipe yet';
      this.tolerance.textContent = `Difficulty: ${DIFFICULTY_LABELS[view.difficulty]}. Start a game to get a random recipe.`;

      for (const row of this.rows) {
        row.value.textContent = '—';
      }

      return;
    }

    const { recipe } = view;

    this.name.textContent = recipe.name;
    this.tolerance.textContent = `${DIFFICULTY_LABELS[view.difficulty]} · Brew tolerance: ±${String(view.tolerance)}`;

    for (const row of this.rows) {
      row.value.textContent = formatRange(recipe[row.config.parameter]);
    }
  }
}
