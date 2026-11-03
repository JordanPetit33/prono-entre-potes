import { Component, computed, inject, signal } from '@angular/core';
import { Id, Player } from '../core/models/app-data';
import { AppStore } from '../core/state/app-store';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-players-page',
  imports: [ConfirmDialog],
  templateUrl: './players-page.html',
  styleUrl: './players-page.css',
})
export class PlayersPage {
  private readonly store = inject(AppStore);

  protected readonly players = this.store.players;
  protected readonly readOnly = this.store.readOnly;

  protected readonly newName = signal('');
  protected readonly addError = signal<string | null>(null);

  protected readonly renamingId = signal<Id | null>(null);
  protected readonly renameValue = signal('');
  protected readonly renameError = signal<string | null>(null);

  protected readonly toDelete = signal<Player | null>(null);
  protected readonly deleteMessage = computed(() => {
    const player = this.toDelete();
    return player ? `Supprimer ${player.name} ? Ses pronostics seront aussi supprimés.` : '';
  });

  protected add(event: Event): void {
    event.preventDefault();
    const result = this.store.addPlayer(this.newName());
    if (result.ok) {
      this.newName.set('');
      this.addError.set(null);
    } else {
      this.addError.set(result.error);
    }
  }

  protected startRename(player: Player): void {
    this.renamingId.set(player.id);
    this.renameValue.set(player.name);
    this.renameError.set(null);
  }

  protected saveRename(event: Event): void {
    event.preventDefault();
    const id = this.renamingId();
    if (id === null) return;
    const result = this.store.renamePlayer(id, this.renameValue());
    if (result.ok) {
      this.cancelRename();
    } else {
      this.renameError.set(result.error);
    }
  }

  protected cancelRename(): void {
    this.renamingId.set(null);
    this.renameError.set(null);
  }

  protected confirmDelete(): void {
    const player = this.toDelete();
    if (player) {
      this.store.removePlayer(player.id);
    }
    this.toDelete.set(null);
  }

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
