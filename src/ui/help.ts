import { DIFFICULTY_LABELS, getDifficultySettings } from '../data/difficulty';
import { getReactions } from '../logic/reactions';
import type { Difficulty, IDifficultySettings, IReaction } from '../types/game';
import { createButton, createElement } from './dom';
import { createDialogActions, ModalDialog } from './dialogs';

const createRules = (settings: IDifficultySettings): HTMLOListElement => {
  const rules: string[] = [
    'Open the Menu to choose Easy, Medium or Hard. The difficulty can be changed only before a game starts.',
    'Press Start Game. A random recipe appears with 3 target ranges: Temperature, Density and Magic Power.',
    `Click ingredients on the shelf or drag them into the cauldron to add them to the cauldron (up to ${String(settings.maxCauldronIngredients)}). Every ingredient changes the 3 values: hover or focus a card to see them.`,
    'Every ingredient has a limited stock (the number in the circle). Used ingredients are never returned.',
    `Watch the bars. When a value glows green it fits the recipe range ±${String(settings.tolerance)}.`,
    `Press Brew. A correct potion gives +${String(settings.scorePerBrew)} score and +${String(settings.timeBonusSeconds)} s, a wrong one costs 1 life.`,
    'Pour Out empties a wrong mixture for 10 seconds instead of a life. The poured ingredients are not returned.',
    `You start with ${String(settings.startTimeSeconds)} seconds and ${String(settings.lives)} lives. The game ends when the time is over, the lives are lost or the ingredients run out.`,
    'Pause any time. The game also pauses when you switch to another tab.',
    'An unfinished game is saved automatically. After a reload press Continue Game to go on from the pause screen. Exit to Menu deletes the save.',
  ];

  return createElement(
    'ol',
    { className: 'help__rules' },
    rules.map((rule: string) => createElement('li', { text: rule })),
  );
};

const createReactions = (difficulty: Difficulty): HTMLElement => {
  const reactions: IReaction[] = getReactions(difficulty);
  const title = `Reactions on ${DIFFICULTY_LABELS[difficulty]}`;

  if (reactions.length === 0) {
    return createElement('p', {
      className: 'help__reactions-empty',
      text: `${title}: none. Values are plain sums.`,
    });
  }

  return createElement('div', { className: 'help__reactions' }, [
    createElement('h3', { className: 'help__subtitle', text: title }),
    createElement(
      'ul',
      { className: 'help__reaction-list' },
      reactions.map((reaction: IReaction) =>
        createElement('li', {}, [
          createElement('strong', { text: `${reaction.name}: ` }),
          createElement('span', { text: reaction.description }),
        ]),
      ),
    ),
  ]);
};

export class HelpView {
  private readonly dialog: ModalDialog = new ModalDialog('dialog--help');

  public show(difficulty: Difficulty): void {
    const close: HTMLButtonElement = createButton('Got it', 'button button--primary', () => {
      this.dialog.close();
    });

    this.dialog.open(
      'How to play',
      [
        createRules(getDifficultySettings(difficulty)),
        createReactions(difficulty),
        createDialogActions([close]),
      ],
      () => {
        this.dialog.close();
      },
    );

    close.focus();
  }

  public hide(): void {
    this.dialog.close();
  }
}
