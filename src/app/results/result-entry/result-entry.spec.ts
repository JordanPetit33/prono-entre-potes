import { Component, computed, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemoryStorage } from '../../../testing/memory-storage';
import { AppData, createEmptyAppData } from '../../core/models/app-data';
import { AppStore } from '../../core/state/app-store';
import { APP_STORAGE, DATA_KEY } from '../../core/storage/storage-repository';
import { Clock } from '../../core/time/clock';
import { ResultEntry } from './result-entry';

const NOW = new Date('2026-11-15T17:00:00.000Z');
const PAST = '2026-11-15T14:00:00.000Z';
const FUTURE = '2026-11-22T14:00:00.000Z';

@Component({
  imports: [ResultEntry],
  template: `<app-result-entry [match]="match()" [result]="result()" />`,
})
class Host {
  readonly store = inject(AppStore);
  readonly match = computed(() => this.store.matches()[0]);
  readonly result = computed(() => this.store.results()[0] ?? null);
}

describe('ResultEntry', () => {
  let fixture: ComponentFixture<Host>;
  let store: AppStore;

  async function render(kickoff: string, data: Partial<AppData> = {}): Promise<void> {
    const initial: AppData = {
      ...createEmptyAppData(),
      players: [{ id: 'p1', name: 'Karim', createdAt: '2026-11-01T10:00:00.000Z' }],
      matches: [{ id: 'm1', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff }],
      ...data,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_STORAGE, useValue: new MemoryStorage({ [DATA_KEY]: JSON.stringify(initial) }) },
        { provide: Clock, useValue: { now: () => NOW } },
      ],
    });
    store = TestBed.inject(AppStore);
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
  }

  const el = (): HTMLElement => fixture.nativeElement;
  const home = (): HTMLInputElement | null => el().querySelector('#result-home-m1');
  const away = (): HTMLInputElement | null => el().querySelector('#result-away-m1');
  const dialog = (): HTMLDialogElement => el().querySelector('dialog')!;
  const shownResult = (): string | undefined =>
    el().querySelector('[data-testid="result"]')?.textContent?.replace(/\s+/g, '');

  function button(label: string, root: HTMLElement = el()): HTMLButtonElement | undefined {
    return Array.from(root.querySelectorAll('button')).find((b) => b.textContent?.trim() === label);
  }

  async function click(label: string, root?: HTMLElement): Promise<void> {
    const found = button(label, root);
    if (!found) throw new Error(`Bouton « ${label} » introuvable`);
    found.click();
    await fixture.whenStable();
  }

  async function type(input: HTMLInputElement, value: string): Promise<void> {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function enter(homeScore: string, awayScore: string): Promise<void> {
    await type(home()!, homeScore);
    await type(away()!, awayScore);
    el().querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  describe('sans résultat', () => {
    it('propose deux champs de score avec un libellé et un bouton « Enregistrer le résultat »', async () => {
      await render(PAST);
      expect(el().querySelector('label[for="result-home-m1"]')?.textContent?.trim()).toBe('Buts de Lille');
      expect(el().querySelector('label[for="result-away-m1"]')?.textContent?.trim()).toBe('Buts de Nice');
      expect(home()?.getAttribute('inputmode')).toBe('numeric');
      expect(button('Enregistrer le résultat')).toBeDefined();
    });

    it('match commencé : enregistre le résultat sans confirmation', async () => {
      await render(PAST);
      await enter('2', '1');
      expect(dialog().open).toBe(false);
      expect(store.results().map((r) => r.score)).toEqual([{ home: 2, away: 1 }]);
    });

    it('un score invalide affiche une erreur et n’enregistre rien', async () => {
      await render(PAST);
      await enter('2', 'x');
      expect(el().querySelector('#result-error-m1')?.textContent?.trim()).toBe(
        'Le score doit être un nombre entier de 0 à 99.',
      );
      expect(store.results()).toEqual([]);
    });
  });

  describe('avant le coup d’envoi (F-41)', () => {
    beforeEach(() => render(FUTURE));

    it('demande une confirmation', async () => {
      await enter('2', '1');
      expect(dialog().open).toBe(true);
      expect(dialog().textContent).toContain('pas encore commencé');
      expect(store.results()).toEqual([]);
    });

    it('annuler n’enregistre rien', async () => {
      await enter('2', '1');
      await click('Annuler', dialog());
      expect(dialog().open).toBe(false);
      expect(store.results()).toEqual([]);
    });

    it('confirmer enregistre le résultat', async () => {
      await enter('2', '1');
      await click('Enregistrer quand même', dialog());
      expect(dialog().open).toBe(false);
      expect(store.results().map((r) => r.score)).toEqual([{ home: 2, away: 1 }]);
    });
  });

  describe('avec un résultat', () => {
    beforeEach(() =>
      render(PAST, { results: [{ matchId: 'm1', score: { home: 2, away: 1 }, enteredAt: NOW.toISOString() }] }),
    );

    it('affiche le score et les boutons « Corriger » et « Supprimer le résultat »', () => {
      expect(shownResult()).toBe('2–1');
      expect(home()).toBeNull();
      expect(button('Corriger')).toBeDefined();
      expect(button('Supprimer le résultat')).toBeDefined();
    });

    it('« Corriger » rouvre les champs, préremplis, et enregistre la correction', async () => {
      await click('Corriger');
      expect(home()?.value).toBe('2');
      expect(away()?.value).toBe('1');
      await enter('3', '1');
      expect(store.results().map((r) => r.score)).toEqual([{ home: 3, away: 1 }]);
      expect(shownResult()).toBe('3–1');
    });

    it('« Annuler » referme la correction sans rien changer', async () => {
      await click('Corriger');
      await type(home()!, '5');
      await click('Annuler');
      expect(shownResult()).toBe('2–1');
    });

    it('« Supprimer le résultat » demande une confirmation', async () => {
      await click('Supprimer le résultat');
      expect(dialog().open).toBe(true);
      expect(dialog().textContent).toContain('Lille – Nice');
    });

    it('annuler la suppression garde le résultat', async () => {
      await click('Supprimer le résultat');
      await click('Annuler', dialog());
      expect(store.results()).toHaveLength(1);
    });

    it('confirmer la suppression retire le résultat', async () => {
      await click('Supprimer le résultat');
      await click('Supprimer', dialog());
      expect(store.results()).toEqual([]);
      expect(home()).not.toBeNull();
    });
  });

  it('en lecture seule, tout est désactivé', async () => {
    const data: AppData = {
      ...createEmptyAppData(),
      matches: [{ id: 'm1', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff: PAST }],
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: APP_STORAGE,
          useValue: new MemoryStorage({ [DATA_KEY]: JSON.stringify({ ...data, schemaVersion: 2 }) }),
        },
        { provide: Clock, useValue: { now: () => NOW } },
      ],
    });
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(home()?.disabled).toBe(true);
    expect(button('Enregistrer le résultat')?.disabled).toBe(true);
  });
});
