import { createButton, createElement } from './dom';
import { createDialogActions, ModalDialog } from './dialogs';

export interface IConfirmOptions {
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
}

// In-app confirmation dialog, used instead of the browser's built-in one.
export class ConfirmDialog {
  private readonly dialog: ModalDialog = new ModalDialog('dialog--confirm');

  public ask(options: IConfirmOptions): void {
    const cancel: HTMLButtonElement = createButton('Cancel', 'button', () => {
      this.dialog.close();
    });
    const confirm: HTMLButtonElement = createButton(
      options.confirmText,
      'button button--danger',
      () => {
        this.dialog.close();
        options.onConfirm();
      },
    );

    this.dialog.open(
      options.title,
      [
        createElement('p', { className: 'dialog__text', text: options.message }),
        createDialogActions([confirm, cancel]),
      ],
      () => {
        this.dialog.close();
      },
    );

    cancel.focus();
  }
}
