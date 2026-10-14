import {
  isValidPlayerName,
  PLAYER_NAME_MAX_LENGTH,
  PLAYER_NAME_MIN_LENGTH,
} from '../logic/leaderboard';
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
  onOpenLeaderboard: () => void;
  // Returns false when the result could not be saved.
  onSubmitScore: (name: string) => boolean;
}

export interface IGameOverViewState {
  score: number;
  reason: GameOverReason | null;
  isTopScore: boolean;
}

const NAME_HINT = `${String(PLAYER_NAME_MIN_LENGTH)}–${String(PLAYER_NAME_MAX_LENGTH)} characters: letters, digits, space, _ and -`;

export class GameOverView {
  private readonly dialog: ModalDialog = new ModalDialog('dialog--game-over');

  public constructor(private readonly actions: IGameOverActions) {}

  public get isOpen(): boolean {
    return this.dialog.isOpen;
  }

  public show(view: IGameOverViewState): void {
    const playAgain: HTMLButtonElement = createButton(
      'Play again',
      'button button--primary',
      () => {
        this.actions.onPlayAgain();
      },
    );
    const leaderboard: HTMLButtonElement = createButton('Leaderboard', 'button', () => {
      this.actions.onOpenLeaderboard();
    });
    const menu: HTMLButtonElement = createButton('Main menu', 'button', () => {
      this.actions.onExitToMenu();
    });

    const content: HTMLElement[] = [
      createElement('p', {
        className: 'game-over__reason',
        text: view.reason ? GAME_OVER_REASONS[view.reason] : '',
      }),
      createElement('p', { className: 'game-over__label', text: 'Final score:' }),
      createElement('p', { className: 'game-over__score', text: String(view.score) }),
    ];

    let focusTarget: HTMLElement = playAgain;

    if (view.isTopScore) {
      const { form, input } = this.createNameForm();

      content.push(form);
      focusTarget = input;
    } else {
      content.push(
        createElement('p', {
          className: 'dialog__text',
          text: view.score > 0 ? 'Not enough for the Top-10 this time.' : 'Brew a potion to score.',
        }),
      );
    }

    content.push(createDialogActions([playAgain, leaderboard, menu]));

    this.dialog.open('Game Over', content, () => {
      this.actions.onExitToMenu();
    });

    focusTarget.focus();
  }

  public hide(): void {
    this.dialog.close();
  }

  private createNameForm(): { form: HTMLFormElement; input: HTMLInputElement } {
    const input: HTMLInputElement = createElement('input', {
      className: 'game-over__input',
      attributes: {
        type: 'text',
        name: 'player-name',
        autocomplete: 'nickname',
        maxlength: String(PLAYER_NAME_MAX_LENGTH),
        placeholder: 'AlchemistName',
        'aria-describedby': 'player-name-hint',
      },
    });
    const hint: HTMLParagraphElement = createElement('p', {
      className: 'game-over__hint',
      text: NAME_HINT,
      attributes: { id: 'player-name-hint', 'aria-live': 'polite' },
    });
    const submit: HTMLButtonElement = createElement('button', {
      className: 'button button--primary',
      text: 'Submit score',
      attributes: { type: 'submit' },
    });
    const form: HTMLFormElement = createElement('form', { className: 'game-over__form' }, [
      createElement(
        'label',
        { className: 'game-over__form-label', text: 'New Top-10 result! Enter your name:' },
        [input],
      ),
      hint,
      submit,
    ]);

    form.noValidate = true;
    form.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();

      if (!isValidPlayerName(input.value)) {
        hint.textContent = `Invalid name. ${NAME_HINT}`;
        hint.classList.add('is-error');
        input.setAttribute('aria-invalid', 'true');
        input.focus();

        return;
      }

      const isSaved: boolean = this.actions.onSubmitScore(input.value);

      form.replaceChildren(
        createElement('p', {
          className: isSaved ? 'game-over__saved' : 'game-over__hint is-error',
          text: isSaved
            ? 'Your result is saved in the Top-10!'
            : 'The result could not be saved: browser storage is not available.',
        }),
      );
    });

    return { form, input };
  }
}
