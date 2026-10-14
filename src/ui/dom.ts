interface IElementOptions {
  className?: string;
  text?: string;
  attributes?: Record<string, string>;
}

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: IElementOptions = {},
  children: readonly Node[] = [],
): HTMLElementTagNameMap[K] => {
  const element: HTMLElementTagNameMap[K] = document.createElement(tag);

  if (options.className !== undefined) {
    element.className = options.className;
  }

  if (options.text !== undefined) {
    element.textContent = options.text;
  }

  if (options.attributes !== undefined) {
    for (const [name, value] of Object.entries(options.attributes)) {
      element.setAttribute(name, value);
    }
  }

  element.append(...children);

  return element;
};

export const createButton = (
  text: string,
  className: string,
  onClick: () => void,
): HTMLButtonElement => {
  const button: HTMLButtonElement = createElement('button', {
    className,
    text,
    attributes: { type: 'button' },
  });

  button.addEventListener('click', onClick);

  return button;
};
