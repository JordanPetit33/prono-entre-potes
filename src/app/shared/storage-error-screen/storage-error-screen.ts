import { Component, inject, signal } from '@angular/core';
import { AppStore } from '../../core/state/app-store';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

/** Écran affiché à la place de l'application quand les données enregistrées sont illisibles (spec §6). */
@Component({
  selector: 'app-storage-error-screen',
  imports: [ConfirmDialog],
  templateUrl: './storage-error-screen.html',
  styleUrl: './storage-error-screen.css',
})
export class StorageErrorScreen {
  private readonly store = inject(AppStore);

  protected readonly confirming = signal(false);
  protected readonly error = signal<string | null>(null);

  protected reset(): void {
    this.confirming.set(false);
    const result = this.store.resetData();
    this.error.set(result.ok ? null : result.error);
  }
}
