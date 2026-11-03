import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('routes', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  function pageTitle(): string | undefined {
    return (harness.routeNativeElement as HTMLElement | null)?.querySelector('h2')?.textContent?.trim();
  }

  it('redirige "/" vers "/journee"', async () => {
    await harness.navigateByUrl('/');
    expect(router.url).toBe('/journee');
    expect(pageTitle()).toBe('Journée');
  });

  it.each([
    ['/journee', 'Journée'],
    ['/journee/3', 'Journée'],
    ['/resultats/3', 'Résultats'],
    ['/classement', 'Classement'],
    ['/joueurs', 'Joueurs'],
  ])('"%s" affiche la page « %s »', async (url, title) => {
    await harness.navigateByUrl(url);
    expect(router.url).toBe(url);
    expect(pageTitle()).toBe(title);
  });

  it('redirige une route inconnue vers "/journee"', async () => {
    await harness.navigateByUrl('/nimporte-quoi');
    expect(router.url).toBe('/journee');
    expect(pageTitle()).toBe('Journée');
  });
});
