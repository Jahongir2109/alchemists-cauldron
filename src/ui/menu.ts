import { DIFFICULTIES, DIFFICULTY_LABELS, getDifficultySettings } from '../data/difficulty';
import type { Difficulty, IDifficultySettings } from '../types/game';
import { createButton, createElement } from './dom';
import { ModalDialog } from './dialogs';

export interface IMenuActions {
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onNewGame: () => void;
  onOpenLeaderboard: () => void;
}

// Short button text built from the same settings object the game uses.
export const describeDifficulty = (settings: IDifficultySettings): string =>
  `${String(settings.shelfSize)} ingredients · ${String(settings.startTimeSeconds)} s · ±${String(settings.tolerance)} · ${String(settings.lives)} lives`;

// Actions the player uses outside of a run.
export class MenuView {
  private readonly dialog: ModalDialog = new ModalDialog('dialog--menu');

  public constructor(private readonly actions: IMenuActions) {}

  public show(difficulty: Difficulty, focusDifficulty = false): void {
    const difficultyButtons: HTMLButtonElement[] = DIFFICULTIES.map((item: Difficulty) =>
      this.createDifficultyButton(item, item === difficulty),
    );
    const newGame: HTMLButtonElement = createButton('New Game', 'button button--primary', () => {
      this.dialog.close();
      this.actions.onNewGame();
    });
    const leaderboard: HTMLButtonElement = createButton('Leaderboard', 'button', () => {
      this.actions.onOpenLeaderboard();
    });
    const close: HTMLButtonElement = createButton('Close', 'button', () => {
      this.dialog.close();
    });

    this.dialog.open(
      'Menu',
      [
        createElement('p', { className: 'menu__label', text: 'Difficulty' }),
        createElement(
          'div',
          {
            className: 'menu__difficulty',
            attributes: { role: 'group', 'aria-label': 'Difficulty' },
          },
          difficultyButtons,
        ),
        createElement('div', { className: 'menu__list' }, [newGame, leaderboard, close]),
      ],
      () => {
        this.dialog.close();
      },
    );

    const selected: HTMLButtonElement | undefined =
      difficultyButtons[DIFFICULTIES.indexOf(difficulty)];

    (focusDifficulty && selected ? selected : newGame).focus();
  }

  public hide(): void {
    this.dialog.close();
  }

  private createDifficultyButton(difficulty: Difficulty, isSelected: boolean): HTMLButtonElement {
    const button: HTMLButtonElement = createElement(
      'button',
      {
        className: isSelected ? 'button menu__option is-selected' : 'button menu__option',
        attributes: { type: 'button', 'aria-pressed': String(isSelected) },
      },
      [
        createElement('span', {
          className: 'menu__option-name',
          text: DIFFICULTY_LABELS[difficulty],
        }),
        createElement('span', {
          className: 'menu__option-info',
          text: describeDifficulty(getDifficultySettings(difficulty)),
        }),
      ],
    );

    button.addEventListener('click', () => {
      this.actions.onSelectDifficulty(difficulty);
      this.show(difficulty, true);
    });

    return button;
  }
}
