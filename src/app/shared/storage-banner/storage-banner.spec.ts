import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemoryStorage } from '../../../testing/memory-storage';
import { createEmptyAppData } from '../../core/models/app-data';
import { AppStore } from '../../core/state/app-store';
import { APP_STORAGE, DATA_KEY } from '../../core/storage/storage-repository';
import { StorageBanner } from './storage-banner';

describe('StorageBanner', () => {
  let storage: MemoryStorage;
  let fixture: ComponentFixture<StorageBanner>;

  async function render(setup: (storage: MemoryStorage) => void = () => {}): Promise<HTMLElement> {
    storage = new MemoryStorage();
    setup(storage);
    TestBed.configureTestingModule({ providers: [{ provide: APP_STORAGE, useValue: storage }] });
    fixture = TestBed.createComponent(StorageBanner);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('n’affiche rien quand tout va bien', async () => {
    const el = await render();
    expect(el.textContent?.trim()).toBe('');
  });

  it('stockage inaccessible : bandeau permanent « non conservées »', async () => {
    const el = await render((s) => (s.blocked = true));
    const banner = el.querySelector('[role="status"]');
    expect(banner?.textContent).toContain('Vos données ne seront pas conservées sur cet appareil.');
    expect(banner?.querySelector('button')).toBeNull();
  });

  it('version plus récente : invite à mettre à jour l’application', async () => {
    const el = await render((s) =>
      s.setItem(DATA_KEY, JSON.stringify({ ...createEmptyAppData(), schemaVersion: 2 })),
    );
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Mettez à jour l’application');
  });

  describe('échec d’enregistrement', () => {
    async function renderWithQuotaError(): Promise<HTMLElement> {
      const el = await render();
      storage.full = true;
      TestBed.inject(AppStore).addPlayer('Tom');
      await fixture.whenStable();
      return el;
    }

    it('stockage plein : affiche un message d’erreur', async () => {
      const el = await renderWithQuotaError();
      expect(el.querySelector('[role="alert"]')?.textContent).toContain('L’espace de stockage est plein');
    });

    it('le message peut être fermé', async () => {
      const el = await renderWithQuotaError();
      const close = el.querySelector<HTMLButtonElement>('[role="alert"] button');
      expect(close?.getAttribute('aria-label')).toBe('Fermer le message');
      close!.click();
      await fixture.whenStable();
      expect(el.querySelector('[role="alert"]')).toBeNull();
      expect(TestBed.inject(AppStore).storageError()).toBeNull();
    });
  });
});
