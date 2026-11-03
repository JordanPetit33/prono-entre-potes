import { Component, computed, inject } from '@angular/core';
import { AppStore, SAVE_ERROR_MESSAGES } from '../../core/state/app-store';

/** Bandeaux liés au stockage : stockage indisponible, version plus récente, échec d'enregistrement (spec §6). */
@Component({
  selector: 'app-storage-banner',
  templateUrl: './storage-banner.html',
  styleUrl: './storage-banner.css',
})
export class StorageBanner {
  private readonly store = inject(AppStore);

  protected readonly status = this.store.storageStatus;
  protected readonly errorMessage = computed(() => {
    const error = this.store.storageError();
    return error ? SAVE_ERROR_MESSAGES[error] : null;
  });

  protected dismiss(): void {
    this.store.dismissStorageError();
  }
}
