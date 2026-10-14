import { formatLeaderboardDate } from '../logic/leaderboard';
import { clearLeaderboard, loadLeaderboard } from '../storage/leaderboard';
import type { ILeaderboardEntry } from '../types/game';
import { ConfirmDialog } from './confirm';
import { createButton, createElement } from './dom';
import { createDialogActions, ModalDialog } from './dialogs';

const COLUMNS: readonly string[] = ['#', 'Name', 'Score', 'Date'];

const createTable = (
  entries: readonly ILeaderboardEntry[],
  highlight: ILeaderboardEntry | null,
): HTMLElement => {
  if (entries.length === 0) {
    return createElement('p', {
      className: 'dialog__text leaderboard__empty',
      text: 'No results yet. Brew some potions to get on the board!',
    });
  }

  const head: HTMLTableSectionElement = createElement('thead', {}, [
    createElement(
      'tr',
      {},
      COLUMNS.map((column: string) =>
        createElement('th', { text: column, attributes: { scope: 'col' } }),
      ),
    ),
  ]);

  const body: HTMLTableSectionElement = createElement(
    'tbody',
    {},
    entries.map((entry: ILeaderboardEntry, index: number) =>
      createElement(
        'tr',
        {
          className:
            highlight?.date === entry.date && highlight.name === entry.name
              ? 'leaderboard__row is-current'
              : 'leaderboard__row',
        },
        [
          createElement('td', { className: 'leaderboard__rank', text: String(index + 1) }),
          // Player names are user input: always rendered as text, never as markup.
          createElement('td', { className: 'leaderboard__name', text: entry.name }),
          createElement('td', { className: 'leaderboard__score', text: String(entry.score) }),
          createElement('td', {
            className: 'leaderboard__date',
            text: formatLeaderboardDate(entry.date),
          }),
        ],
      ),
    ),
  );

  return createElement('div', { className: 'leaderboard__scroll' }, [
    createElement('table', { className: 'leaderboard__table' }, [head, body]),
  ]);
};

export class LeaderboardView {
  private readonly dialog: ModalDialog = new ModalDialog('dialog--leaderboard');

  private readonly confirm: ConfirmDialog = new ConfirmDialog();

  private onClose: (() => void) | null = null;

  public show(
    highlight: ILeaderboardEntry | null = null,
    onClose: (() => void) | null = null,
  ): void {
    this.onClose = onClose;

    const entries: ILeaderboardEntry[] = loadLeaderboard();
    const close: HTMLButtonElement = createButton('Close', 'button button--primary', () => {
      this.hide();
    });
    const clear: HTMLButtonElement = createButton(
      'Clear Leaderboard',
      'button button--danger',
      () => {
        this.confirm.ask({
          title: 'Clear leaderboard?',
          message: 'All Top-10 results will be deleted. This cannot be undone.',
          confirmText: 'Clear',
          onConfirm: (): void => {
            clearLeaderboard();
            this.show(null, this.onClose);
          },
        });
      },
    );

    clear.disabled = entries.length === 0;

    this.dialog.open(
      'Top-10 Alchemists',
      [createTable(entries, highlight), createDialogActions([close, clear])],
      () => {
        this.hide();
      },
    );

    close.focus();
  }

  public hide(): void {
    this.dialog.close();

    const callback: (() => void) | null = this.onClose;

    this.onClose = null;
    callback?.();
  }
}
