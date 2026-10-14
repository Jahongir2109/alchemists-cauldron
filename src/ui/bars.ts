import { BARS } from '../data/bars';
import type { IBarConfig } from '../data/bars';
import { toFillSegment, toPercent, toSegment } from '../logic/bar-scale';
import type { IBarSegment } from '../logic/bar-scale';
import { expandRange, isInRange } from '../logic/brew-check';
import type { ICauldronValues, IRecipe, IRecipeRange } from '../types/game';
import { createElement } from './dom';
import { formatNumber } from './format';
import { createIcon } from './icons';

export interface IBarsViewState {
  values: ICauldronValues;
  recipe: IRecipe | null;
  tolerance: number;
}

interface IBarElements {
  config: IBarConfig;
  root: HTMLDivElement;
  value: HTMLSpanElement;
  zone: HTMLDivElement;
  core: HTMLDivElement;
  fill: HTMLDivElement;
  marker: HTMLDivElement;
}

const setSegment = (element: HTMLElement, segment: IBarSegment): void => {
  element.style.setProperty('--start', `${String(segment.start)}%`);
  element.style.setProperty('--width', `${String(segment.width)}%`);
};

const createScaleLabels = (scale: IRecipeRange): HTMLDivElement => {
  const labels: number[] = scale.min < 0 ? [scale.min, 0, scale.max] : [scale.min, scale.max];

  return createElement(
    'div',
    { className: 'bar__scale', attributes: { 'aria-hidden': 'true' } },
    labels.map((label: number) =>
      createElement('span', {
        className: 'bar__scale-label',
        text: formatNumber(label),
        attributes: { style: `--position: ${String(toPercent(label, scale))}%` },
      }),
    ),
  );
};

const createBar = (config: IBarConfig): IBarElements => {
  const value: HTMLSpanElement = createElement('span', { className: 'bar__value', text: '0' });
  const zone: HTMLDivElement = createElement('div', { className: 'bar__zone' });
  const core: HTMLDivElement = createElement('div', { className: 'bar__zone-core' });
  const fill: HTMLDivElement = createElement('div', { className: 'bar__fill' });
  const marker: HTMLDivElement = createElement('div', { className: 'bar__marker' });
  const track: HTMLDivElement = createElement('div', { className: 'bar__track' }, [
    zone,
    core,
    fill,
    marker,
  ]);

  if (config.scale.min < 0) {
    const zero: HTMLDivElement = createElement('div', { className: 'bar__zero' });

    zero.style.setProperty('--position', `${String(toPercent(0, config.scale))}%`);
    track.append(zero);
  }

  const root: HTMLDivElement = createElement(
    'div',
    { className: `bar bar--${config.parameter}`, attributes: { role: 'group' } },
    [
      createElement('div', { className: 'bar__header' }, [
        createIcon(config.icon, 'bar__icon'),
        createElement('span', { className: 'bar__label', text: config.label }),
        value,
      ]),
      track,
      createScaleLabels(config.scale),
    ],
  );

  root.setAttribute('aria-label', config.label);

  return { config, root, value, zone, core, fill, marker };
};

export class BarsView {
  private readonly bars: IBarElements[];

  public constructor(container: HTMLElement) {
    this.bars = BARS.map((config: IBarConfig) => createBar(config));
    container.append(...this.bars.map((bar: IBarElements) => bar.root));
  }

  public render(view: IBarsViewState): void {
    for (const bar of this.bars) {
      this.renderBar(bar, view);
    }
  }

  private renderBar(bar: IBarElements, view: IBarsViewState): void {
    const { parameter, scale } = bar.config;
    const current: number = view.values[parameter];

    bar.value.textContent = formatNumber(current);
    setSegment(bar.fill, toFillSegment(current, scale));
    bar.marker.style.setProperty('--position', `${String(toPercent(current, scale))}%`);

    if (!view.recipe) {
      bar.zone.hidden = true;
      bar.core.hidden = true;
      bar.root.classList.remove('is-in-range');

      return;
    }

    const checkedRange: IRecipeRange = expandRange(view.recipe[parameter], view.tolerance);

    bar.zone.hidden = false;
    bar.core.hidden = false;
    setSegment(bar.zone, toSegment(checkedRange, scale));
    setSegment(bar.core, toSegment(view.recipe[parameter], scale));
    bar.root.classList.toggle('is-in-range', isInRange(current, checkedRange));
  }
}
