import { createElement } from './dom';

export interface IGameLayout {
  root: HTMLDivElement;
  header: HTMLElement;
  field: HTMLElement;
  shelf: HTMLElement;
  cauldron: HTMLElement;
  bars: HTMLElement;
  controls: HTMLElement;
  centerAction: HTMLDivElement;
}

const createPanel = (className: string, title: string): HTMLElement =>
  createElement('section', { className: `panel ${className}` }, [
    createElement('h2', { className: 'panel__title', text: title }),
  ]);

export const createGameLayout = (): IGameLayout => {
  const header: HTMLElement = createElement('header', { className: 'hud' }, [
    createElement('h1', { className: 'hud__title', text: "Alchemist's Cauldron" }),
  ]);

  const shelf: HTMLElement = createPanel('shelf', 'Ingredients');
  const cauldron: HTMLElement = createElement('section', {
    className: 'cauldron',
    attributes: { 'aria-label': 'Cauldron' },
  });
  const bars: HTMLElement = createElement('section', {
    className: 'bars',
    attributes: { 'aria-label': 'Cauldron parameters' },
  });
  const field: HTMLElement = createElement('main', { className: 'field' }, [shelf, cauldron, bars]);

  const centerAction: HTMLDivElement = createElement('div', { className: 'controls__center' });
  const controls: HTMLElement = createElement('footer', { className: 'controls' }, [centerAction]);

  const root: HTMLDivElement = createElement('div', { className: 'game' }, [
    header,
    field,
    controls,
  ]);

  return { root, header, field, shelf, cauldron, bars, controls, centerAction };
};
