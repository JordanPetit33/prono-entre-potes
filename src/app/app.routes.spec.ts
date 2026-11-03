import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from './app.config';
import { MatchdayPage } from './matchday/matchday-page';
import { PlayersPage } from './players/players-page';
import { ResultsPage } from './results/results-page';
import { StandingsPage } from './standings/standings-page';

describe('routes', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: appConfig.providers,
    });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  function routedPage(): unknown {
    return harness.routeDebugElement?.componentInstance;
  }

  it('redirige "/" vers "/journee"', async () => {
    await harness.navigateByUrl('/');
    expect(router.url).toBe('/journee');
    expect(routedPage()).toBeInstanceOf(MatchdayPage);
  });

  it.each<[string, Type<unknown>]>([
    ['/journee', MatchdayPage],
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

  it('redirige une route inconnue vers "/journee"', async () => {
    await harness.navigateByUrl('/nimporte-quoi');
    expect(router.url).toBe('/journee');
    expect(routedPage()).toBeInstanceOf(MatchdayPage);
  });
});
