import { createElement } from './dom';

export interface IGameLayout {
  root: HTMLDivElement;
  header: HTMLElement;
  field: HTMLElement;
  shelf: HTMLElement;
  cauldron: HTMLElement;
  recipe: HTMLElement;
  bars: HTMLElement;
  controls: HTMLElement;
  controlsLeft: HTMLDivElement;
  centerAction: HTMLDivElement;
  controlsRight: HTMLDivElement;
}

const createPanel = (tag: 'section' | 'aside', className: string, title: string): HTMLElement =>
  createElement(tag, { className: `panel ${className}` }, [
    createElement('h2', { className: 'panel__title', text: title }),
  ]);

export const createGameLayout = (): IGameLayout => {
  const header: HTMLElement = createElement('header', { className: 'hud' }, [
    createElement('h1', { className: 'hud__title', text: "Alchemist's Cauldron" }),
  ]);

  const shelf: HTMLElement = createPanel('section', 'shelf', 'Ingredients');
  const cauldron: HTMLElement = createElement('section', {
    className: 'cauldron',
    attributes: { 'aria-label': 'Cauldron' },
  });
  const recipe: HTMLElement = createPanel('aside', 'recipe', 'Current recipe');
  const bars: HTMLElement = createElement('section', {
    className: 'bars',
    attributes: { 'aria-label': 'Cauldron parameters' },
  });
  const field: HTMLElement = createElement('main', { className: 'field' }, [
    shelf,
    cauldron,
    recipe,
    bars,
  ]);

  const controlsLeft: HTMLDivElement = createElement('div', { className: 'controls__left' });
  const centerAction: HTMLDivElement = createElement('div', { className: 'controls__center' });
  const controlsRight: HTMLDivElement = createElement('div', { className: 'controls__right' });
  const controls: HTMLElement = createElement('footer', { className: 'controls' }, [
    controlsLeft,
    centerAction,
    controlsRight,
  ]);

  const root: HTMLDivElement = createElement('div', { className: 'game' }, [
    header,
    field,
    controls,
  ]);

  return {
    root,
    header,
    field,
    shelf,
    cauldron,
    recipe,
    bars,
    controls,
    controlsLeft,
    centerAction,
    controlsRight,
  };
};
