import type { GameOverReason } from '../types/game';
import { createButton, createElement } from './dom';
import { createDialogActions, ModalDialog } from './dialogs';

export const GAME_OVER_REASONS: Readonly<Record<GameOverReason, string>> = {
  time: 'Time is up!',
  lives: 'No lives left!',
  ingredients: 'Out of ingredients',
};

export interface IGameOverActions {
  onPlayAgain: () => void;
  onExitToMenu: () => void;
}

export class GameOverView {
  private readonly dialog: ModalDialog = new ModalDialog('dialog--game-over');

  public constructor(private readonly actions: IGameOverActions) {}

  public show(score: number, reason: GameOverReason | null): void {
    const playAgain: HTMLButtonElement = createButton(
      'Play again',
      'button button--primary',
      () => {
        this.actions.onPlayAgain();
      },
    );
    const menu: HTMLButtonElement = createButton('Main menu', 'button', () => {
      this.actions.onExitToMenu();
    });

    this.dialog.open(
      'Game Over',
      [
        createElement('p', {
          className: 'game-over__reason',
          text: reason ? GAME_OVER_REASONS[reason] : '',
        }),
        createElement('p', { className: 'game-over__label', text: 'Final score:' }),
        createElement('p', { className: 'game-over__score', text: String(score) }),
        createDialogActions([playAgain, menu]),
      ],
      () => {
        this.actions.onExitToMenu();
      },
    );

    playAgain.focus();
  }

  public hide(): void {
    this.dialog.close();
  }
}
