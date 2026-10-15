import { DIFFICULTIES, DIFFICULTY_LABELS } from '../data/difficulty';
import { formatLeaderboardDate, getDifficultyBoard } from '../logic/leaderboard';
import { clearLeaderboard, loadLeaderboard } from '../storage/leaderboard';
import type { Difficulty, ILeaderboardEntry } from '../types/game';
import { ConfirmDialog } from './confirm';
import { createButton, createElement } from './dom';
import { createDialogActions, ModalDialog } from './dialogs';

const COLUMNS: readonly string[] = ['#', 'Name', 'Score', 'Difficulty', 'Date'];

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
            className: 'leaderboard__difficulty',
            text: DIFFICULTY_LABELS[entry.difficulty],
          }),
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

  private highlight: ILeaderboardEntry | null = null;

  public show(
    difficulty: Difficulty,
    highlight: ILeaderboardEntry | null = null,
    onClose: (() => void) | null = null,
  ): void {
    this.onClose = onClose;
    this.highlight = highlight;
    this.render(difficulty);
  }

  public hide(): void {
    this.dialog.close();

    const callback: (() => void) | null = this.onClose;

    this.onClose = null;
    callback?.();
  }

  private render(difficulty: Difficulty, focusTab = false): void {
    const all: ILeaderboardEntry[] = loadLeaderboard();
    const entries: ILeaderboardEntry[] = getDifficultyBoard(all, difficulty);
    const tabs: HTMLButtonElement[] = DIFFICULTIES.map((item: Difficulty) => {
      const tab: HTMLButtonElement = createButton(
        DIFFICULTY_LABELS[item],
        item === difficulty ? 'button leaderboard__tab is-active' : 'button leaderboard__tab',
        () => {
          this.render(item, true);
        },
      );

      tab.setAttribute('aria-pressed', String(item === difficulty));

      return tab;
    });
    const close: HTMLButtonElement = createButton('Close', 'button button--primary', () => {
      this.hide();
    });
    const clear: HTMLButtonElement = createButton(
      'Clear Leaderboard',
      'button button--danger',
      () => {
        this.confirm.ask({
          title: 'Clear leaderboard?',
          message: 'All Top-10 results of every difficulty will be deleted. This cannot be undone.',
          confirmText: 'Clear',
          onConfirm: (): void => {
            clearLeaderboard();
            this.render(difficulty);
          },
        });
      },
    );

    clear.disabled = all.length === 0;

    this.dialog.open(
      'Top-10 Alchemists',
      [
        createElement(
          'div',
          {
            className: 'leaderboard__tabs',
            attributes: { role: 'group', 'aria-label': 'Difficulty' },
          },
          tabs,
        ),
        createTable(entries, this.highlight),
        createDialogActions([close, clear]),
      ],
      () => {
        this.hide();
      },
    );

    const activeTab: HTMLButtonElement | undefined = tabs[DIFFICULTIES.indexOf(difficulty)];

    (focusTab && activeTab ? activeTab : close).focus();
  }
}
