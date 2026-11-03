import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createEmptyAppData } from '../core/models/app-data';
import { AppStore } from '../core/state/app-store';
import { DATA_KEY } from '../core/storage/storage-repository';
import { ResultsPage } from './results-page';

describe('ResultsPage', () => {
  let fixture: ComponentFixture<ResultsPage>;
  let store: AppStore;

  async function render(numero = '1'): Promise<void> {
    store = TestBed.inject(AppStore);
    fixture = TestBed.createComponent(ResultsPage);
    fixture.componentRef.setInput('numero', numero);
    await fixture.whenStable();
  }

  const el = (): HTMLElement => fixture.nativeElement;
  const field = (id: string): HTMLInputElement => el().querySelector(`#${id}`)!;
  const form = (): HTMLFormElement => field('home-team').closest('form')!;

  function listedMatches(): string[] {
    return Array.from(el().querySelectorAll('[data-testid="match-teams"]')).map(
      (n) => n.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    );
  }

  async function type(id: string, value: string): Promise<void> {
    field(id).value = value;
    field(id).dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function submit(): Promise<void> {
    form().dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  async function fillAndSubmit(home: string, away: string, kickoff: string): Promise<void> {
    await type('home-team', home);
    await type('away-team', away);
    await type('kickoff', kickoff);
    await submit();
  }

  function seed(): void {
    TestBed.inject(AppStore).replaceData({
      ...createEmptyAppData(),
      matches: [
        { id: 'm1', matchday: 1, homeTeam: 'Rennes', awayTeam: 'Monaco', kickoff: '2026-11-15T16:00:00.000Z' },
        { id: 'm2', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff: '2026-11-15T14:00:00.000Z' },
        { id: 'm3', matchday: 2, homeTeam: 'Lens', awayTeam: 'Brest', kickoff: '2026-11-22T14:00:00.000Z' },
      ],
    });
  }

  it('affiche le titre et le numéro de journée', async () => {
    await render('3');
    expect(el().querySelector('h2')?.textContent?.trim()).toBe('Résultats');
    expect(el().textContent).toContain('Journée 3');
  });

  it('liste les matchs de la journée demandée, dans l’ordre du coup d’envoi', async () => {
    seed();
    await render('1');
    expect(listedMatches()).toEqual(['Lille – Nice', 'Rennes – Monaco']);
  });

  it('affiche un message quand la journée n’a pas de match', async () => {
    await render('4');
    expect(listedMatches()).toEqual([]);
    expect(el().textContent).toContain('Aucun match pour cette journée.');
  });

  describe('formulaire « Ajouter un match »', () => {
    it('a un libellé pour chaque champ', async () => {
      await render();
      const labels = ['home-team', 'away-team', 'kickoff'].map((id) =>
        el().querySelector(`label[for="${id}"]`)?.textContent?.trim(),
      );
      expect(labels).toEqual(['Équipe à domicile', 'Équipe à l’extérieur', 'Coup d’envoi']);
      expect(field('kickoff').type).toBe('datetime-local');
    });

    it('crée un match dans la journée affichée', async () => {
      await render('2');
      await fillAndSubmit('Lyon', 'Nantes', '2026-11-22T17:00');
      expect(store.matches()).toEqual([
        expect.objectContaining({ matchday: 2, homeTeam: 'Lyon', awayTeam: 'Nantes' }),
      ]);
      expect(listedMatches()).toEqual(['Lyon – Nantes']);
    });

    it('vide les noms d’équipe après un ajout réussi et garde le coup d’envoi', async () => {
      await render();
      await fillAndSubmit('Lyon', 'Nantes', '2026-11-22T17:00');
      expect(field('home-team').value).toBe('');
      expect(field('away-team').value).toBe('');
      expect(field('kickoff').value).toBe('2026-11-22T17:00');
    });

    it('affiche l’erreur sous le champ fautif', async () => {
      await render();
      await fillAndSubmit('Lyon', 'lyon', '2026-11-22T17:00');
      expect(el().querySelector('#away-team-error')?.textContent?.trim()).toBe(
        'Les deux équipes doivent être différentes.',
      );
      expect(field('away-team').getAttribute('aria-invalid')).toBe('true');
      expect(field('away-team').getAttribute('aria-describedby')).toBe('away-team-error');
      expect(el().querySelector('#home-team-error')).toBeNull();
      expect(store.matches()).toEqual([]);
    });

    it('affiche une erreur par champ fautif', async () => {
      await render();
      await submit();
      expect(el().querySelector('#home-team-error')).not.toBeNull();
      expect(el().querySelector('#away-team-error')).not.toBeNull();
      expect(el().querySelector('#kickoff-error')).not.toBeNull();
    });

    it('est désactivé en lecture seule', async () => {
      window.localStorage.setItem(DATA_KEY, JSON.stringify({ ...createEmptyAppData(), schemaVersion: 2 }));
      await render();
      expect(field('home-team').disabled).toBe(true);
      expect(form().querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
    });
  });
});
