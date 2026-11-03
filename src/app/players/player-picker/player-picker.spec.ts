import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppStore } from '../../core/state/app-store';
import { PlayerPicker } from './player-picker';

describe('PlayerPicker', () => {
  let fixture: ComponentFixture<PlayerPicker>;
  let store: AppStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    store = TestBed.inject(AppStore);
    store.addPlayer('Karim');
    store.addPlayer('Léa');
    fixture = TestBed.createComponent(PlayerPicker);
    await fixture.whenStable();
  });

  const el = (): HTMLElement => fixture.nativeElement;
  const toggle = (): HTMLButtonElement => el().querySelector('button[aria-haspopup]')!;
  const menu = (): HTMLElement | null => el().querySelector('[data-testid="player-menu"]');

  function menuButton(name: string): HTMLButtonElement {
    const found = Array.from(menu()?.querySelectorAll('button') ?? []).find((b) => b.textContent?.trim() === name);
    if (!found) throw new Error(`Joueur « ${name} » introuvable dans le menu`);
    return found;
  }

  async function click(target: HTMLElement): Promise<void> {
    target.click();
    await fixture.whenStable();
  }

  it('affiche le nom du joueur actif', () => {
    expect(toggle().textContent).toContain('Karim');
  });

  it('a un libellé accessible qui nomme le joueur actif', () => {
    expect(toggle().getAttribute('aria-label')).toBe('Changer de joueur, joueur actuel : Karim');
  });

  it('la liste est fermée au départ', () => {
    expect(menu()).toBeNull();
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
  });

  it('ouvre la liste de tous les joueurs', async () => {
    await click(toggle());
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    const names = Array.from(menu()!.querySelectorAll('button')).map((b) => b.textContent?.trim());
    expect(names).toEqual(['Karim', 'Léa']);
  });

  it('signale le joueur actif dans la liste', async () => {
    await click(toggle());
    expect(menuButton('Karim').getAttribute('aria-current')).toBe('true');
    expect(menuButton('Léa').getAttribute('aria-current')).toBeNull();
  });

  it('propose un lien « Gérer les joueurs » vers /joueurs', async () => {
    await click(toggle());
    const link = menu()!.querySelector('a');
    expect(link?.textContent?.trim()).toBe('Gérer les joueurs');
    expect(link?.getAttribute('href')).toBe('/joueurs');
  });

  it('choisir un joueur le rend actif et referme la liste', async () => {
    await click(toggle());
    await click(menuButton('Léa'));
    expect(store.activePlayer()?.name).toBe('Léa');
    expect(menu()).toBeNull();
    expect(toggle().textContent).toContain('Léa');
  });

  it('Échap referme la liste', async () => {
    await click(toggle());
    el().querySelector('[data-testid="player-menu"]')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await fixture.whenStable();
    expect(menu()).toBeNull();
  });
});
