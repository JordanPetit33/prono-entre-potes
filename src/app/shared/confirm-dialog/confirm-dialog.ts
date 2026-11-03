import { Component, effect, ElementRef, input, output, viewChild } from '@angular/core';

let nextId = 0;

/** Demande de confirmation, basée sur l'élément <dialog> natif. Le parent l'ouvre et la ferme avec `open`. */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly message = input.required<string>();
  readonly confirmLabel = input('Confirmer');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  /** Identifiant unique : plusieurs boîtes peuvent coexister sur une page. */
  protected readonly messageId = `confirm-dialog-message-${nextId++}`;

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  /** Touche Échap : on laisse le parent décider de la fermeture. */
  protected onCancel(event: Event): void {
    event.preventDefault();
    this.cancelled.emit();
  }
}
