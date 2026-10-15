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

// Plays a CSS animation class again and removes it when the element's own animation ends.
// The timing lives in CSS: no timers are used for visual effects.
export const replayAnimation = (element: HTMLElement, className: string): void => {
  const onEnd = (event: AnimationEvent): void => {
    if (event.target === element) {
      element.classList.remove(className);
      element.removeEventListener('animationend', onEnd);
    }
  };

  element.addEventListener('animationend', onEnd);

  if (!element.classList.contains(className)) {
    element.classList.add(className);

    return;
  }

  // The class is still on: start its running CSS animations from the beginning.
  for (const animation of element.getAnimations({ subtree: true })) {
    animation.cancel();
    animation.play();
  }
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
