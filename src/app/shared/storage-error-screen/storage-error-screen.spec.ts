import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemoryStorage } from '../../../testing/memory-storage';
import { AppStore } from '../../core/state/app-store';
import { APP_STORAGE, BACKUP_KEY, DATA_KEY } from '../../core/storage/storage-repository';
import { StorageErrorScreen } from './storage-error-screen';

describe('StorageErrorScreen', () => {
  let storage: MemoryStorage;
  let store: AppStore;
  let fixture: ComponentFixture<StorageErrorScreen>;

  beforeEach(async () => {
    storage = new MemoryStorage({ [DATA_KEY]: '{pas du json' });
    TestBed.configureTestingModule({ providers: [{ provide: APP_STORAGE, useValue: storage }] });
    store = TestBed.inject(AppStore);
    fixture = TestBed.createComponent(StorageErrorScreen);
    await fixture.whenStable();
  });

  const el = (): HTMLElement => fixture.nativeElement;
  const dialog = (): HTMLDialogElement => el().querySelector('dialog')!;

  function button(label: string, root: HTMLElement = el()): HTMLButtonElement {
    const found = Array.from(root.querySelectorAll('button')).find((b) => b.textContent?.trim() === label);
    if (!found) throw new Error(`Bouton « ${label} » introuvable`);
    return found;
  }

  async function click(target: HTMLButtonElement): Promise<void> {
    target.click();
    await fixture.whenStable();
  }

  it('explique que les données sont illisibles et qu’une copie a été conservée', () => {
    expect(el().querySelector('h2')?.textContent?.trim()).toBe('Données illisibles');
    expect(el().textContent).toContain('Une copie de ces données a été conservée');
  });

  it('« Repartir de zéro » demande une confirmation', async () => {
    await click(button('Repartir de zéro'));
    expect(dialog().open).toBe(true);
  });

  it('annuler ne change rien', async () => {
    await click(button('Repartir de zéro'));
    await click(button('Annuler', dialog()));
    expect(dialog().open).toBe(false);
    expect(store.storageStatus()).toBe('corrupted');
    expect(storage.getItem(DATA_KEY)).toBe('{pas du json');
  });

  it('confirmer repart d’un état vide et l’enregistre', async () => {
    await click(button('Repartir de zéro'));
    await click(button('Effacer et repartir de zéro', dialog()));
    expect(store.storageStatus()).toBe('ok');
    expect(store.players()).toEqual([]);
    expect(JSON.parse(storage.getItem(DATA_KEY)!).players).toEqual([]);
    expect(storage.getItem(BACKUP_KEY)).toBe('{pas du json');
  });
});
