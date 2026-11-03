import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createEmptyAppData } from '../core/models/app-data';
import { AppStore } from '../core/state/app-store';
import { DATA_KEY } from '../core/storage/storage-repository';
import { toDatetimeLocal } from '../core/time/datetime-local';
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

  describe('navigation entre journées', () => {
    const arrow = (label: string): HTMLButtonElement => el().querySelector(`button[aria-label="${label}"]`)!;

    it('« Journée précédente » est désactivée à la journée 1', async () => {
      await render('1');
      expect(arrow('Journée précédente').disabled).toBe(true);
    });

    it('« Journée suivante » reste possible même sans match, pour créer une nouvelle journée', async () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      await render('3');
      expect(arrow('Journée suivante').disabled).toBe(false);
      arrow('Journée suivante').click();
      expect(navigate).toHaveBeenCalledWith('/resultats/4');
    });

    it('« Journée précédente » mène à la journée d’avant', async () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      await render('3');
      arrow('Journée précédente').click();
      expect(navigate).toHaveBeenCalledWith('/resultats/2');
    });

    it('n’affiche pas de compteur de pronostics', async () => {
      await render('3');
      expect(el().querySelector('[role="progressbar"]')).toBeNull();
    });
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

  function buttonByLabel(label: string): HTMLButtonElement | undefined {
    return Array.from(el().querySelectorAll('button')).find(
      (b) => (b.getAttribute('aria-label') ?? b.textContent?.trim()) === label,
    );
  }

  async function click(label: string): Promise<void> {
    const button = buttonByLabel(label);
    if (!button) throw new Error(`Bouton « ${label} » introuvable`);
    button.click();
    await fixture.whenStable();
  }

  describe('modification', () => {
    beforeEach(async () => {
      seed();
      await render('1');
    });

    it('chaque match sans résultat a un bouton « Modifier »', () => {
      expect(buttonByLabel('Modifier Lille – Nice')).toBeDefined();
      expect(buttonByLabel('Modifier Rennes – Monaco')).toBeDefined();
    });

    it('« Modifier » est absent quand le match a un résultat', async () => {
      store.replaceData({
        ...createEmptyAppData(),
        matches: store.matches(),
        results: [{ matchId: 'm2', score: { home: 2, away: 1 }, enteredAt: '2026-11-15T16:00:00.000Z' }],
      });
      await fixture.whenStable();
      expect(buttonByLabel('Modifier Lille – Nice')).toBeUndefined();
      expect(buttonByLabel('Modifier Rennes – Monaco')).toBeDefined();
    });

    it('« Modifier » remplit le formulaire avec le match', async () => {
      await click('Modifier Lille – Nice');
      expect(el().querySelector('form h3')?.textContent?.trim()).toBe('Modifier le match');
      expect(field('home-team').value).toBe('Lille');
      expect(field('away-team').value).toBe('Nice');
      expect(field('kickoff').value).toBe(toDatetimeLocal('2026-11-15T14:00:00.000Z'));
    });

    it('enregistrer modifie le match et revient au mode ajout', async () => {
      await click('Modifier Lille – Nice');
      await type('home-team', 'Lille OSC');
      await submit();
      expect(listedMatches()).toEqual(['Lille OSC – Nice', 'Rennes – Monaco']);
      expect(store.matches()).toHaveLength(3);
      expect(el().querySelector('form h3')?.textContent?.trim()).toBe('Ajouter un match');
      expect(field('home-team').value).toBe('');
    });

    it('affiche l’erreur sous le champ fautif et reste en mode modification', async () => {
      await click('Modifier Lille – Nice');
      await type('away-team', 'lille');
      await submit();
      expect(el().querySelector('#away-team-error')?.textContent?.trim()).toBe(
        'Les deux équipes doivent être différentes.',
      );
      expect(el().querySelector('form h3')?.textContent?.trim()).toBe('Modifier le match');
    });

    it('« Annuler » revient au mode ajout sans rien changer', async () => {
      await click('Modifier Lille – Nice');
      await type('home-team', 'Autre');
      await click('Annuler la modification');
      expect(listedMatches()).toEqual(['Lille – Nice', 'Rennes – Monaco']);
      expect(el().querySelector('form h3')?.textContent?.trim()).toBe('Ajouter un match');
      expect(field('home-team').value).toBe('');
    });
  });

  describe('suppression', () => {
    const dialog = (): HTMLDialogElement => el().querySelector('dialog')!;

    async function clickInDialog(label: string): Promise<void> {
      const button = Array.from(dialog().querySelectorAll('button')).find((b) => b.textContent?.trim() === label);
      if (!button) throw new Error(`Bouton « ${label} » introuvable dans la confirmation`);
      button.click();
      await fixture.whenStable();
    }

    beforeEach(async () => {
      seed();
      await render('1');
    });

    it('demande une confirmation qui précise que les pronostics et le résultat seront supprimés', async () => {
      await click('Supprimer Lille – Nice');
      expect(dialog().open).toBe(true);
      expect(dialog().textContent).toContain('Lille – Nice');
      expect(dialog().textContent).toContain('pronostics');
      expect(dialog().textContent).toContain('résultat');
    });

    it('annuler ne supprime rien', async () => {
      await click('Supprimer Lille – Nice');
      await clickInDialog('Annuler');
      expect(dialog().open).toBe(false);
      expect(listedMatches()).toEqual(['Lille – Nice', 'Rennes – Monaco']);
    });

    it('confirmer supprime le match', async () => {
      await click('Supprimer Lille – Nice');
      await clickInDialog('Supprimer');
      expect(dialog().open).toBe(false);
      expect(listedMatches()).toEqual(['Rennes – Monaco']);
    });

    it('supprimer le match en cours de modification revient au mode ajout', async () => {
      await click('Modifier Lille – Nice');
      await click('Supprimer Lille – Nice');
      await clickInDialog('Supprimer');
      expect(el().querySelector('form h3')?.textContent?.trim()).toBe('Ajouter un match');
    });
  });

  it('en lecture seule, « Modifier » et « Supprimer » sont désactivés', async () => {
    window.localStorage.setItem(
      DATA_KEY,
      JSON.stringify({
        ...createEmptyAppData(),
        schemaVersion: 2,
        matches: [{ id: 'm1', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff: '2026-11-15T14:00:00.000Z' }],
      }),
    );
    await render('1');
    expect(buttonByLabel('Modifier Lille – Nice')?.disabled).toBe(true);
    expect(buttonByLabel('Supprimer Lille – Nice')?.disabled).toBe(true);
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
