import { createButton, createElement } from './dom';
import { createDialogActions, ModalDialog } from './dialogs';

export interface IPauseActions {
  onResume: () => void;
  onExitToMenu: () => void;
}

export class PauseView {
  private readonly dialog: ModalDialog = new ModalDialog('dialog--pause');

  public constructor(private readonly actions: IPauseActions) {}

  public get isOpen(): boolean {
    return this.dialog.isOpen;
  }

  public show(): void {
    const resume: HTMLButtonElement = createButton('Resume', 'button button--primary', () => {
      this.actions.onResume();
    });
    const exit: HTMLButtonElement = createButton('Exit to Menu', 'button', () => {
      this.actions.onExitToMenu();
    });

    this.dialog.open(
      'Paused',
      [
        createElement('p', {
          className: 'dialog__text',
          text: 'The timer is stopped. Resume to continue the same game.',
        }),
        createDialogActions([resume, exit]),
      ],
      () => {
        this.actions.onResume();
      },
    );

    resume.focus();
  }

  public hide(): void {
    this.dialog.close();
  }
}
