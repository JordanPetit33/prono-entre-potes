import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppData, createEmptyAppData } from '../core/models/app-data';
import { AppStore } from '../core/state/app-store';
import { StandingsPage } from './standings-page';

describe('StandingsPage', () => {
  let fixture: ComponentFixture<StandingsPage>;

  async function render(data: AppData = sampleData(), activePlayer = 'p1'): Promise<HTMLElement> {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const store = TestBed.inject(AppStore);
    store.replaceData(data);
    store.setActivePlayer(activePlayer);
    fixture = TestBed.createComponent(StandingsPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function rows(el: HTMLElement): string[][] {
    return Array.from(el.querySelectorAll('tbody tr')).map((tr) =>
      Array.from(tr.querySelectorAll('th, td')).map((cell) => cell.textContent?.trim() ?? ''),
    );
  }

  it('affiche le titre « Classement »', async () => {
    const el = await render();
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Classement');
  });

  it('a les colonnes Rang, Joueur, Points, Scores exacts, Matchs', async () => {
    const el = await render();
    const headers = Array.from(el.querySelectorAll('thead th')).map((th) => th.textContent?.trim());
    expect(headers).toEqual(['Rang', 'Joueur', 'Points', 'Scores exacts', 'Matchs']);
  });

  it('liste les joueurs dans l’ordre du classement', async () => {
    const el = await render();
    expect(rows(el)).toEqual([
      ['1', 'Léa', '3', '1', '1'],
      ['2', 'Karim', '1', '0', '1'],
      ['3', 'Tom', '0', '0', '0'],
    ]);
  });

  it('met en évidence la ligne du joueur actif', async () => {
    const el = await render(sampleData(), 'p1');
    const current = el.querySelectorAll('tbody tr[aria-current="true"]');
    expect(current).toHaveLength(1);
    expect(current[0].textContent).toContain('Karim');
  });

  it('sans joueur, invite à en créer', async () => {
    const el = await render(createEmptyAppData());
    expect(el.querySelector('table')).toBeNull();
    expect(el.textContent).toContain('Aucun joueur pour l’instant.');
    const link = Array.from(el.querySelectorAll('a')).find((a) => a.textContent?.trim() === 'Créer les joueurs');
    expect(link?.getAttribute('href')).toBe('/joueurs');
  });
});

function sampleData(): AppData {
  return {
    ...createEmptyAppData(),
    players: [
      { id: 'p1', name: 'Karim', createdAt: '2026-11-01T10:00:00.000Z' },
      { id: 'p2', name: 'Léa', createdAt: '2026-11-01T10:01:00.000Z' },
      { id: 'p3', name: 'Tom', createdAt: '2026-11-01T10:02:00.000Z' },
    ],
    matches: [{ id: 'm1', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff: '2026-11-15T14:00:00.000Z' }],
    predictions: [
      { playerId: 'p1', matchId: 'm1', score: { home: 1, away: 0 }, updatedAt: '2026-11-14T10:00:00.000Z' },
      { playerId: 'p2', matchId: 'm1', score: { home: 2, away: 1 }, updatedAt: '2026-11-14T10:00:00.000Z' },
    ],
    results: [{ matchId: 'm1', score: { home: 2, away: 1 }, enteredAt: '2026-11-15T16:00:00.000Z' }],
  };
}
