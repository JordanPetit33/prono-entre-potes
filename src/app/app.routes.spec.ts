import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from './app.config';
import { createEmptyAppData } from './core/models/app-data';
import { AppStore } from './core/state/app-store';
import { Clock } from './core/time/clock';
import { MatchdayPage } from './matchday/matchday-page';
import { PlayersPage } from './players/players-page';
import { ResultsPage } from './results/results-page';
import { StandingsPage } from './standings/standings-page';

describe('routes', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, { provide: Clock, useValue: { now: () => new Date('2026-11-14T10:00:00.000Z') } }],
    });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  function routedPage(): unknown {
    return harness.routeDebugElement?.componentInstance;
  }

  it('redirige "/" vers la journée par défaut', async () => {
    await harness.navigateByUrl('/');
    expect(router.url).toBe('/journee/1');
    expect(routedPage()).toBeInstanceOf(MatchdayPage);
  });

  it.each<[string, Type<unknown>]>([
    ['/journee/3', MatchdayPage],
    ['/resultats/3', ResultsPage],
    ['/classement', StandingsPage],
    ['/joueurs', PlayersPage],
  ])('"%s" affiche la page %O', async (url, page) => {
    await harness.navigateByUrl(url);
    expect(router.url).toBe(url);
    expect(routedPage()).toBeInstanceOf(page);
  });

  it('transmet le numéro de journée à la page Résultats', async () => {
    await harness.navigateByUrl('/resultats/3');
    expect((harness.routeNativeElement as HTMLElement).textContent).toContain('Journée 3');
  });

  it('redirige une route inconnue vers la journée par défaut', async () => {
    await harness.navigateByUrl('/nimporte-quoi');
    expect(router.url).toBe('/journee/1');
    expect(routedPage()).toBeInstanceOf(MatchdayPage);
  });

  describe('journée par défaut (F-72)', () => {
    beforeEach(() => {
      TestBed.inject(AppStore).replaceData({
        ...createEmptyAppData(),
        matches: [
          { id: 'm1', matchday: 1, homeTeam: 'A', awayTeam: 'B', kickoff: '2026-11-01T14:00:00.000Z' },
          { id: 'm2', matchday: 2, homeTeam: 'C', awayTeam: 'D', kickoff: '2026-11-20T14:00:00.000Z' },
        ],
      });
    });

    it('"/journee" redirige vers la première journée non verrouillée', async () => {
      await harness.navigateByUrl('/journee');
      expect(router.url).toBe('/journee/2');
      expect(routedPage()).toBeInstanceOf(MatchdayPage);
    });

    it('"/resultats" redirige vers la même journée', async () => {
      await harness.navigateByUrl('/resultats');
      expect(router.url).toBe('/resultats/2');
      expect(routedPage()).toBeInstanceOf(ResultsPage);
    });
  });
});
