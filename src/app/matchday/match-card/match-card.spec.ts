import { Component, computed, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemoryStorage } from '../../../testing/memory-storage';
import { AppData, createEmptyAppData, Result } from '../../core/models/app-data';
import { AppStore } from '../../core/state/app-store';
import { APP_STORAGE, DATA_KEY } from '../../core/storage/storage-repository';
import { Clock } from '../../core/time/clock';
import { MatchCard } from './match-card';

const KICKOFF = '2026-11-15T14:30:00.000Z';
const NOW = new Date('2026-11-14T10:00:00.000Z');

@Component({
  imports: [MatchCard],
  template: `
    <app-match-card
      [match]="match()"
      [prediction]="store.activePredictions().get('m1') ?? null"
      [result]="result()"
      [now]="now()"
    />
  `,
})
class Host {
  readonly store = inject(AppStore);
  readonly match = computed(() => this.store.matches()[0]);
  readonly result = signal<Result | null>(null);
  readonly now = signal(NOW);
}

describe('MatchCard', () => {
  let fixture: ComponentFixture<Host>;
  let store: AppStore;

  async function render(data: AppData = sampleData(), clockNow: Date = NOW): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_STORAGE, useValue: new MemoryStorage({ [DATA_KEY]: JSON.stringify(data) }) },
        { provide: Clock, useValue: { now: () => clockNow } },
      ],
    });
    store = TestBed.inject(AppStore);
    fixture = TestBed.createComponent(Host);
    fixture.componentInstance.now.set(clockNow);
    await fixture.whenStable();
  }

  const el = (): HTMLElement => fixture.nativeElement;
  const homeInput = (): HTMLInputElement | null => el().querySelector('#home-score-m1');
  const awayInput = (): HTMLInputElement | null => el().querySelector('#away-score-m1');
  const status = (): string | undefined => el().querySelector('[data-testid="status"]')?.textContent?.trim();

  function button(label: string): HTMLButtonElement | undefined {
    return Array.from(el().querySelectorAll('button')).find((b) => b.textContent?.trim() === label);
  }

  async function type(input: HTMLInputElement, value: string): Promise<void> {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function submit(): Promise<void> {
    el().querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  it('affiche les deux équipes', async () => {
    await render();
    expect(el().textContent).toContain('Lille');
    expect(el().textContent).toContain('Nice');
  });

  it('affiche l’heure du coup d’envoi au format fr-FR et le temps restant avant clôture', async () => {
    await render();
    const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(KICKOFF));
    expect(el().textContent).toContain(time);
    expect(el().textContent).toContain('clôture dans 1 j 4 h');
  });

  describe('à saisir', () => {
    beforeEach(() => render());

    it('affiche l’état « À saisir »', () => {
      expect(status()).toBe('À saisir');
    });

    it('propose deux champs de score avec un libellé et un clavier numérique', () => {
      expect(el().querySelector('label[for="home-score-m1"]')?.textContent?.trim()).toBe('Buts de Lille');
      expect(el().querySelector('label[for="away-score-m1"]')?.textContent?.trim()).toBe('Buts de Nice');
      expect(homeInput()?.getAttribute('inputmode')).toBe('numeric');
      expect(awayInput()?.getAttribute('inputmode')).toBe('numeric');
    });

    it('« Valider mon prono » enregistre le pronostic', async () => {
      await type(homeInput()!, '2');
      await type(awayInput()!, '1');
      await submit();
      expect(store.activePredictions().get('m1')?.score).toEqual({ home: 2, away: 1 });
      expect(status()).toBe('Prono enregistré');
    });

    it('un score invalide affiche un message sous les champs et n’appelle pas savePrediction', async () => {
      const save = vi.spyOn(store, 'savePrediction');
      await type(homeInput()!, '2');
      await type(awayInput()!, '1,5');
      await submit();
      expect(save).not.toHaveBeenCalled();
      const error = el().querySelector('#score-error-m1');
      expect(error?.textContent?.trim()).toBe('Le score doit être un nombre entier de 0 à 99.');
      expect(homeInput()?.getAttribute('aria-describedby')).toBe('score-error-m1');
    });

    it('un score incomplet est refusé', async () => {
      await type(homeInput()!, '2');
      await submit();
      expect(el().querySelector('#score-error-m1')?.textContent?.trim()).toBe('Saisissez le score des deux équipes.');
    });
  });

  describe('prono enregistré', () => {
    beforeEach(async () => {
      await render({
        ...sampleData(),
        predictions: [{ playerId: 'p1', matchId: 'm1', score: { home: 1, away: 1 }, updatedAt: NOW.toISOString() }],
      });
    });

    it('affiche l’état « Prono enregistré » et le score saisi', () => {
      expect(status()).toBe('Prono enregistré');
      expect(el().querySelector('[data-testid="prediction"]')?.textContent?.replace(/\s+/g, '')).toBe('1–1');
      expect(homeInput()).toBeNull();
    });

    it('« Modifier mon prono » rouvre les champs, préremplis', async () => {
      button('Modifier mon prono')!.click();
      await fixture.whenStable();
      expect(homeInput()?.value).toBe('1');
      expect(awayInput()?.value).toBe('1');
    });

    it('enregistrer la modification remplace le pronostic', async () => {
      button('Modifier mon prono')!.click();
      await fixture.whenStable();
      await type(homeInput()!, '3');
      await submit();
      expect(store.activePredictions().get('m1')?.score).toEqual({ home: 3, away: 1 });
      expect(status()).toBe('Prono enregistré');
    });
  });

  describe('terminé (résultat saisi)', () => {
    const result: Result = { matchId: 'm1', score: { home: 1, away: 0 }, enteredAt: NOW.toISOString() };
    const finalScore = (): string | undefined =>
      el().querySelector('[data-testid="result"]')?.textContent?.replace(/\s+/g, '');

    it('affiche l’état « Terminé » et le score réel, même avant le coup d’envoi', async () => {
      await render();
      fixture.componentInstance.result.set(result);
      await fixture.whenStable();
      expect(status()).toBe('Terminé');
      expect(finalScore()).toBe('1–0');
      expect(homeInput()).toBeNull();
      expect(el().textContent).not.toContain('clôture dans');
    });

    it('affiche le pronostic du joueur actif à côté du score réel', async () => {
      await render({
        ...sampleData(),
        predictions: [{ playerId: 'p1', matchId: 'm1', score: { home: 2, away: 0 }, updatedAt: NOW.toISOString() }],
      });
      fixture.componentInstance.result.set(result);
      await fixture.whenStable();
      expect(el().querySelector('[data-testid="own-prediction"]')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
        'Ton prono : 2 – 0',
      );
    });

    it('signale l’absence de pronostic', async () => {
      await render();
      fixture.componentInstance.result.set(result);
      await fixture.whenStable();
      expect(el().querySelector('[data-testid="own-prediction"]')?.textContent?.trim()).toBe('Pas de prono');
    });

    it('n’affiche aucun bouton', async () => {
      await render();
      fixture.componentInstance.result.set(result);
      await fixture.whenStable();
      expect(el().querySelectorAll('button')).toHaveLength(0);
    });
  });

  describe('verrouillé', () => {
    it('au coup d’envoi : champs désactivés, mention « Verrouillé », pas de bouton', async () => {
      await render(sampleData(), new Date(KICKOFF));
      expect(status()).toBe('Verrouillé');
      expect(homeInput()?.disabled).toBe(true);
      expect(awayInput()?.disabled).toBe(true);
      expect(button('Valider mon prono')).toBeUndefined();
      expect(el().textContent).not.toContain('clôture dans');
    });

    it('garde le pronostic visible une fois verrouillé', async () => {
      await render(
        {
          ...sampleData(),
          predictions: [{ playerId: 'p1', matchId: 'm1', score: { home: 2, away: 0 }, updatedAt: NOW.toISOString() }],
        },
        new Date(KICKOFF),
      );
      expect(homeInput()?.value).toBe('2');
      expect(awayInput()?.value).toBe('0');
      expect(button('Modifier mon prono')).toBeUndefined();
    });


    it('affiche le refus du store si le match se verrouille pendant la saisie', async () => {
      await render(sampleData(), new Date(KICKOFF));
      fixture.componentInstance.now.set(NOW);
      await fixture.whenStable();
      await type(homeInput()!, '2');
      await type(awayInput()!, '1');
      await submit();
      expect(el().querySelector('#score-error-m1')?.textContent?.trim()).toBe(
        'Ce match a commencé, le pronostic est verrouillé.',
      );
    });
  });
});

function sampleData(): AppData {
  return {
    ...createEmptyAppData(),
    players: [{ id: 'p1', name: 'Karim', createdAt: '2026-11-01T10:00:00.000Z' }],
    matches: [{ id: 'm1', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff: KICKOFF }],
  };
}
