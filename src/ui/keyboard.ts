import type { GameStatus } from '../types/game';

export interface IKeyboardActions {
  getStatus: () => GameStatus;
  onAddIngredient: (shelfIndex: number) => void;
  onBrew: () => void;
  onPourOut: () => void;
  onPause: () => void;
}

export type ShortcutAction = 'brew' | 'pour-out' | 'pause';

// Small explicit key map. event.code keeps the keys the same on every keyboard layout.
const ACTION_KEYS: Readonly<Record<string, ShortcutAction>> = {
  KeyB: 'brew',
  KeyO: 'pour-out',
  KeyP: 'pause',
  Escape: 'pause',
};

export const SHORTCUT_HINTS: readonly string[] = [
  '1–8: add the ingredient from that shelf place',
  'B: brew',
  'O: pour out',
  'P or Esc: pause (Esc or Resume continues the game)',
];

const DIGIT_CODE = /^(?:Digit|Numpad)([1-8])$/;

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement);

const getShelfIndex = (code: string): number | null => {
  const digit: string | undefined = DIGIT_CODE.exec(code)?.[1];

  return digit === undefined ? null : Number(digit) - 1;
};

// The only keyboard handler of the game. It works only while a run is active,
// so the start, pause and game over screens keep the normal browser behaviour.
export const listenToShortcuts = (actions: IKeyboardActions): void => {
  const handlers: Readonly<Record<ShortcutAction, () => void>> = {
    brew: actions.onBrew,
    'pour-out': actions.onPourOut,
    pause: actions.onPause,
  };

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (
      actions.getStatus() !== 'playing' ||
      event.repeat ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      isTypingTarget(event.target) ||
      document.querySelector('dialog[open]') !== null
    ) {
      return;
    }

    const shelfIndex: number | null = getShelfIndex(event.code);

    if (shelfIndex !== null) {
      event.preventDefault();
      actions.onAddIngredient(shelfIndex);

      return;
    }

    const action: ShortcutAction | undefined = ACTION_KEYS[event.code];

    if (action === undefined) {
      return;
    }

    event.preventDefault();
    handlers[action]();
  });
};
