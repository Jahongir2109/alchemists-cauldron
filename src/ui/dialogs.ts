import { createElement } from './dom';

// Custom in-app dialog on top of the native <dialog> element (no alert / confirm).
export class ModalDialog {
  private readonly dialog: HTMLDialogElement;

  private readonly title: HTMLHeadingElement;

  private readonly body: HTMLDivElement;

  private onCancel: (() => void) | null = null;

  public constructor(className: string) {
    this.title = createElement('h2', { className: 'dialog__title' });
    this.body = createElement('div', { className: 'dialog__body' });
    this.dialog = createElement('dialog', { className: `dialog ${className}` }, [
      createElement('div', { className: 'dialog__frame' }, [this.title, this.body]),
    ]);

    // Escape key: run the dialog's own cancel action instead of a silent close.
    this.dialog.addEventListener('cancel', (event: Event) => {
      event.preventDefault();
      this.onCancel?.();
    });

    document.body.append(this.dialog);
  }

  public get isOpen(): boolean {
    return this.dialog.open;
  }

  public open(title: string, content: readonly Node[], onCancel: (() => void) | null): void {
    this.title.textContent = title;
    this.body.replaceChildren(...content);
    this.onCancel = onCancel;

    if (!this.dialog.open) {
      this.dialog.showModal();
    }
  }

  public close(): void {
    if (this.dialog.open) {
      this.dialog.close();
    }
  }
}

export const createDialogActions = (buttons: readonly HTMLButtonElement[]): HTMLDivElement =>
  createElement('div', { className: 'dialog__actions' }, buttons);
