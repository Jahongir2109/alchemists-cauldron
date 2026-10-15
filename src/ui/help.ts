import type { IDifficultySettings } from '../types/game';
import { createButton, createElement } from './dom';
import { createDialogActions, ModalDialog } from './dialogs';

const createRules = (settings: IDifficultySettings): HTMLOListElement => {
  const rules: string[] = [
    'Open the Menu to choose Easy, Medium or Hard. The difficulty can be changed only before a game starts.',
    'Press Start Game. A random recipe appears with 3 target ranges: Temperature, Density and Magic Power.',
    `Click ingredients on the shelf to add them to the cauldron (up to ${String(settings.maxCauldronIngredients)}). Every ingredient changes the 3 values.`,
    'Every ingredient has a limited stock (the number in the circle). Used ingredients are never returned.',
    `Watch the bars. When a value glows green it fits the recipe range ±${String(settings.tolerance)}.`,
    `Press Brew. A correct potion gives +${String(settings.scorePerBrew)} score and +${String(settings.timeBonusSeconds)} s, a wrong one costs 1 life.`,
    `You start with ${String(settings.startTimeSeconds)} seconds and ${String(settings.lives)} lives. The game ends when the time is over, the lives are lost or the ingredients run out.`,
    'Pause any time. The game also pauses when you switch to another tab.',
  ];

  return createElement(
    'ol',
    { className: 'help__rules' },
    rules.map((rule: string) => createElement('li', { text: rule })),
  );
};

export class HelpView {
  private readonly dialog: ModalDialog = new ModalDialog('dialog--help');

  public show(settings: IDifficultySettings): void {
    const close: HTMLButtonElement = createButton('Got it', 'button button--primary', () => {
      this.dialog.close();
    });

    this.dialog.open('How to play', [createRules(settings), createDialogActions([close])], () => {
      this.dialog.close();
    });

    close.focus();
  }

  public hide(): void {
    this.dialog.close();
  }
}
