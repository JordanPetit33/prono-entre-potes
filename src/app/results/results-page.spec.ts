import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DUPLICATE_CHECK_LOG } from '../core/duplicates/duplicate-check';
import { LANGUAGE_MODEL, LanguageModelRequest } from '../core/duplicates/language-model';
import { createEmptyAppData } from '../core/models/app-data';
import { AppStore } from '../core/state/app-store';
import { DATA_KEY } from '../core/storage/storage-repository';
import { toKickoffFields } from '../core/time/kickoff-fields';
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

  async function fillAndSubmit(home: string, away: string, date: string, time: string): Promise<void> {
    await type('home-team', home);
    await type('away-team', away);
    await type('kickoff-date', date);
    await type('kickoff-time', time);
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

    it('n’affiche ni compteur de pronostics ni classement', async () => {
      await render('3');
      expect(el().querySelector('[role="progressbar"]')).toBeNull();
      expect(el().querySelector('[data-testid="standing"]')).toBeNull();
    });
  });

  it('liste les matchs de la journée demandée, dans l’ordre du coup d’envoi', async () => {
    seed();
    await render('1');
    expect(listedMatches()).toEqual(['Lille – Nice', 'Rennes – Monaco']);
  });

  it('chaque match a sa saisie de résultat', async () => {
    seed();
    await render('1');
    expect(el().querySelector('#result-home-m1')).not.toBeNull();
    expect(el().querySelector('#result-home-m2')).not.toBeNull();
    expect(el().querySelector('#result-home-m3')).toBeNull();
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
      const expected = toKickoffFields('2026-11-15T14:00:00.000Z');
      expect(field('kickoff-date').value).toBe(expected.date);
      expect(field('kickoff-time').value).toBe(expected.time);
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
    // La boîte de la page, et non celles des saisies de résultat de chaque match.
    const dialog = (): HTMLDialogElement => el().querySelector(':scope > app-confirm-dialog dialog')!;

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
      const labels = ['home-team', 'away-team', 'kickoff-date', 'kickoff-time'].map((id) =>
        el().querySelector(`label[for="${id}"]`)?.textContent?.trim(),
      );
      expect(labels).toEqual(['Équipe à domicile', 'Équipe à l’extérieur', 'Date', 'Heure']);
      expect(el().querySelector('fieldset legend')?.textContent?.trim()).toBe('Coup d’envoi');
    });

    it('la date et l’heure sont des champs texte au format JJ/MM/AAAA et HH:mm', async () => {
      await render();
      expect(field('kickoff-date').type).toBe('text');
      expect(field('kickoff-date').placeholder).toBe('JJ/MM/AAAA');
      expect(field('kickoff-time').type).toBe('text');
      expect(field('kickoff-time').placeholder).toBe('HH:mm');
    });

    it('crée un match dans la journée affichée', async () => {
      await render('2');
      await fillAndSubmit('Lyon', 'Nantes', '22/11/2026', '17:00');
      expect(store.matches()).toEqual([
        expect.objectContaining({
          matchday: 2,
          homeTeam: 'Lyon',
          awayTeam: 'Nantes',
          kickoff: new Date('2026-11-22T17:00').toISOString(),
        }),
      ]);
      expect(listedMatches()).toEqual(['Lyon – Nantes']);
    });

    it('vide les noms d’équipe après un ajout réussi et garde le coup d’envoi', async () => {
      await render();
      await fillAndSubmit('Lyon', 'Nantes', '22/11/2026', '17:00');
      expect(field('home-team').value).toBe('');
      expect(field('away-team').value).toBe('');
      expect(field('kickoff-date').value).toBe('22/11/2026');
      expect(field('kickoff-time').value).toBe('17:00');
    });

    it('affiche l’erreur sous le champ fautif', async () => {
      await render();
      await fillAndSubmit('Lyon', 'lyon', '22/11/2026', '17:00');
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

    it('une date impossible affiche son erreur sous le coup d’envoi, avec les autres erreurs', async () => {
      await render();
      await fillAndSubmit('', 'Nantes', '31/02/2026', '17:00');
      expect(el().querySelector('#kickoff-error')?.textContent?.trim()).toBe('Cette date n’existe pas.');
      expect(el().querySelector('#home-team-error')).not.toBeNull();
      expect(field('kickoff-date').getAttribute('aria-invalid')).toBe('true');
      expect(field('kickoff-time').getAttribute('aria-describedby')).toBe('kickoff-error');
      expect(store.matches()).toEqual([]);
    });

    it('une heure au mauvais format affiche son erreur', async () => {
      await render();
      await fillAndSubmit('Lyon', 'Nantes', '22/11/2026', '5 PM');
      expect(el().querySelector('#kickoff-error')?.textContent?.trim()).toBe(
        'L’heure doit être au format HH:mm, de 00:00 à 23:59.',
      );
      expect(store.matches()).toEqual([]);
    });

    it('est désactivé en lecture seule', async () => {
      window.localStorage.setItem(DATA_KEY, JSON.stringify({ ...createEmptyAppData(), schemaVersion: 2 }));
      await render();
      expect(field('home-team').disabled).toBe(true);
      expect(form().querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
    });
  });

  describe('signalement d’un match en double', () => {
    let received: LanguageModelRequest[];
    let answer: () => Promise<string>;

    beforeEach(() => {
      received = [];
      answer = () => Promise.resolve('{"doublon": null}');
      TestBed.configureTestingModule({
        providers: [
          {
            provide: LANGUAGE_MODEL,
            useValue: (request: LanguageModelRequest) => {
              received.push(request);
              return answer();
            },
          },
          { provide: DUPLICATE_CHECK_LOG, useValue: () => undefined },
        ],
      });
    });

    const openDialog = (): HTMLDialogElement | null => el().querySelector('dialog[open]');

    async function clickInDialog(label: string): Promise<void> {
      const button = Array.from(openDialog()?.querySelectorAll('button') ?? []).find(
        (b) => b.textContent?.trim() === label,
      );
      if (!button) throw new Error(`Bouton « ${label} » introuvable dans la boîte de dialogue`);
      button.click();
      await fixture.whenStable();
    }

    const notice = (): string | undefined =>
      el().querySelector('[data-testid="duplicate-check-notice"]')?.textContent?.trim();

    it('sans doublon, ajoute le match sans rien demander', async () => {
      seed();
      await render('1');
      await fillAndSubmit('Lens', 'Brest', '15/11/2026', '17:00');
      expect(openDialog()).toBeNull();
      expect(listedMatches()).toContain('Lens – Brest');
      expect(notice()).toBeUndefined();
    });

    it('risque 2 : avec un doublon signalé, n’ajoute le match qu’après « Ajouter quand même »', async () => {
      answer = () => Promise.resolve('{"doublon": "1"}');
      seed();
      await render('1');
      await fillAndSubmit('LOSC', 'OGC Nice', '15/11/2026', '17:00');

      expect(openDialog()?.textContent).toContain('Ce match ressemble à Lille – Nice, déjà saisi pour cette journée.');
      expect(store.matches()).toHaveLength(3);

      await clickInDialog('Ajouter quand même');
      expect(openDialog()).toBeNull();
      expect(store.matches()).toHaveLength(4);
      expect(listedMatches()).toContain('LOSC – OGC Nice');
      expect(field('home-team').value).toBe('');
    });

    it('risque 2 : « Annuler » laisse les matchs inchangés', async () => {
      answer = () => Promise.resolve('{"doublon": "1"}');
      seed();
      await render('1');
      const before = store.matches();
      await fillAndSubmit('LOSC', 'OGC Nice', '15/11/2026', '17:00');

      await clickInDialog('Annuler');
      expect(openDialog()).toBeNull();
      expect(store.matches()).toEqual(before);
      // La saisie reste là pour être corrigée.
      expect(field('home-team').value).toBe('LOSC');
    });

    it('risque 3 : si la vérification est indisponible, le match est ajouté et le message s’affiche', async () => {
      answer = () => Promise.reject(new Error('Ollama absent'));
      seed();
      await render('1');
      await fillAndSubmit('Lens', 'Brest', '15/11/2026', '17:00');

      expect(listedMatches()).toContain('Lens – Brest');
      expect(notice()).toBe('Vérification des doublons indisponible.');
    });

    it('risque 4 : n’envoie au modèle ni nom de joueur, ni score, ni date', async () => {
      store = TestBed.inject(AppStore);
      store.replaceData({
        ...createEmptyAppData(),
        players: [{ id: 'p1', name: 'Héloïse', createdAt: '2026-11-01T10:00:00.000Z' }],
        matches: [{ id: 'm1', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff: '2026-11-15T14:00:00.000Z' }],
        predictions: [
          { playerId: 'p1', matchId: 'm1', score: { home: 3, away: 2 }, updatedAt: '2026-11-10T10:00:00.000Z' },
        ],
        results: [{ matchId: 'm1', score: { home: 1, away: 0 }, enteredAt: '2026-11-15T16:00:00.000Z' }],
      });
      await render('1');
      await fillAndSubmit('Lens', 'Brest', '15/11/2026', '17:00');

      expect(received).toHaveLength(1);
      const [request] = received;
      const sent = request.instructions + request.input;
      for (const forbidden of ['Héloïse', 'p1', 'm1', '2026', 'score']) {
        expect(sent).not.toContain(forbidden);
      }
      const data = JSON.parse(request.input.slice('<donnees>'.length, -'</donnees>'.length));
      expect(data).toEqual({
        nouveau: { domicile: 'Lens', exterieur: 'Brest' },
        existants: [{ numero: '1', domicile: 'Lille', exterieur: 'Nice' }],
      });
    });

    it('n’interroge pas le modèle quand la saisie est invalide', async () => {
      seed();
      await render('1');
      await fillAndSubmit('Lyon', 'lyon', '15/11/2026', '17:00');
      expect(received).toEqual([]);
      expect(el().querySelector('#away-team-error')).not.toBeNull();
    });

    it('ne vérifie pas les doublons lors d’une modification', async () => {
      seed();
      await render('1');
      await click('Modifier Lille – Nice');
      await type('home-team', 'LOSC');
      await submit();
      expect(received).toEqual([]);
      expect(listedMatches()).toContain('LOSC – Nice');
    });
  });
});
