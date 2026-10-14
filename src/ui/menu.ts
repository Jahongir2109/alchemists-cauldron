import { DIFFICULTY_LABELS } from '../data/difficulty';
import type { Difficulty } from '../types/game';
import { createButton, createElement } from './dom';
import { ModalDialog } from './dialogs';

export interface IMenuActions {
  onNewGame: () => void;
  onOpenLeaderboard: () => void;
}

// Actions the player uses outside of a run.
export class MenuView {
  private readonly dialog: ModalDialog = new ModalDialog('dialog--menu');

  public constructor(private readonly actions: IMenuActions) {}

  public show(difficulty: Difficulty): void {
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
        createElement('p', {
          className: 'dialog__text',
          text: `Difficulty: ${DIFFICULTY_LABELS[difficulty]}`,
        }),
        createElement('div', { className: 'menu__list' }, [newGame, leaderboard, close]),
      ],
      () => {
        this.dialog.close();
      },
    );

    newGame.focus();
  }

  public hide(): void {
    this.dialog.close();
  }
}
