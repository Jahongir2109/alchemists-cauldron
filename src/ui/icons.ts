import { createElement } from './dom';

// Every game element has its own SVG asset; they are inlined as markup so CSS can style them.
const ICON_FILES: Record<string, string> = import.meta.glob<string>('../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const ICONS: ReadonlyMap<string, string> = new Map(
  Object.entries(ICON_FILES).map(([path, markup]: [string, string]) => [
    path.replace(/^.*\//, '').replace(/\.svg$/, ''),
    markup,
  ]),
);

export const createIcon = (name: string, className = 'icon'): HTMLSpanElement => {
  const icon: HTMLSpanElement = createElement('span', {
    className,
    attributes: { 'aria-hidden': 'true' },
  });

  icon.innerHTML = ICONS.get(name) ?? '';

  return icon;
};
