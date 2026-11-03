import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppData, createEmptyAppData } from '../core/models/app-data';
import { AppStore } from '../core/state/app-store';
import { MatchdayPage } from './matchday-page';

describe('MatchdayPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatchdayPage],
      providers: [provideRouter([])],
    });
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(MatchdayPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  describe('sans joueur', () => {
    it('affiche l’écran d’accueil « Bienvenue »', async () => {
      const el = await render();
      expect(el.querySelector('h2')?.textContent?.trim()).toBe('Bienvenue');
    });

    it('propose un lien « Créer les joueurs » vers /joueurs', async () => {
      const el = await render();
      const link = Array.from(el.querySelectorAll('a')).find((a) => a.textContent?.trim() === 'Créer les joueurs');
      expect(link?.getAttribute('href')).toBe('/joueurs');
    });
  });

  describe('avec au moins un joueur', () => {
    it('affiche la journée et non l’écran d’accueil', async () => {
      TestBed.inject(AppStore).addPlayer('Karim');
      const el = await render();
      expect(el.querySelector('h2')?.textContent?.trim()).toBe('Journée');
      expect(el.textContent).not.toContain('Bienvenue');
    });
  });

  describe('matchs de la journée', () => {
    async function renderMatchday(numero?: string): Promise<HTMLElement> {
      TestBed.inject(AppStore).replaceData(sampleData());
      const fixture = TestBed.createComponent(MatchdayPage);
      if (numero !== undefined) {
        fixture.componentRef.setInput('numero', numero);
      }
      await fixture.whenStable();
      return fixture.nativeElement as HTMLElement;
    }

    function cards(el: HTMLElement): string[] {
      return Array.from(el.querySelectorAll('app-match-card')).map((card) =>
        Array.from(card.querySelectorAll('[data-testid="team-name"]'))
          .map((n) => n.textContent?.trim())
          .join(' – '),
      );
    }

    it('affiche une carte par match de la journée demandée, dans l’ordre du coup d’envoi', async () => {
      const el = await renderMatchday('1');
      expect(el.textContent).toContain('Journée 1');
      expect(cards(el)).toEqual(['Lille – Nice', 'Rennes – Monaco']);
    });

    it('affiche la journée demandée dans la route', async () => {
      const el = await renderMatchday('2');
      expect(el.textContent).toContain('Journée 2');
      expect(cards(el)).toEqual(['Lens – Brest']);
    });

    it('sans numéro, affiche la journée 1', async () => {
      const el = await renderMatchday();
      expect(cards(el)).toEqual(['Lille – Nice', 'Rennes – Monaco']);
    });

    it('les cartes montrent les pronostics du joueur actif', async () => {
      const el = await renderMatchday('2');
      expect(el.querySelector('[data-testid="prediction"]')?.textContent?.replace(/\s+/g, '')).toBe('2–2');
    });

    it('sans match, invite à en ajouter dans l’écran Résultats', async () => {
      const el = await renderMatchday('7');
      expect(cards(el)).toEqual([]);
      expect(el.textContent).toContain('Aucun match pour cette journée.');
      const link = Array.from(el.querySelectorAll('a')).find((a) => a.textContent?.trim() === 'Ajouter des matchs');
      expect(link?.getAttribute('href')).toBe('/resultats/7');
    });
  });
});

function sampleData(): AppData {
  const future = (days: number, hour: number): string =>
    new Date(Date.now() + days * 86_400_000 + hour * 3_600_000).toISOString();
  return {
    ...createEmptyAppData(),
    players: [{ id: 'p1', name: 'Karim', createdAt: '2026-11-01T10:00:00.000Z' }],
    matches: [
      { id: 'm1', matchday: 1, homeTeam: 'Rennes', awayTeam: 'Monaco', kickoff: future(10, 3) },
      { id: 'm2', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff: future(10, 1) },
      { id: 'm3', matchday: 2, homeTeam: 'Lens', awayTeam: 'Brest', kickoff: future(17, 1) },
    ],
    predictions: [{ playerId: 'p1', matchId: 'm3', score: { home: 2, away: 2 }, updatedAt: '2026-11-02T10:00:00.000Z' }],
  };
}
