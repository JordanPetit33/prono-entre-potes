import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BottomNav } from './bottom-nav';

@Component({ template: '<app-bottom-nav />', imports: [BottomNav] })
class Host {}

describe('BottomNav', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'journee', component: Host },
          { path: 'journee/:numero', component: Host },
          { path: 'resultats', component: Host },
          { path: 'resultats/:numero', component: Host },
          { path: 'classement', component: Host },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  function links(): HTMLAnchorElement[] {
    return Array.from(harness.fixture.nativeElement.querySelectorAll('nav a'));
  }

  it('affiche les liens « Journée », « Résultats », « Classement »', async () => {
    await harness.navigateByUrl('/journee');
    expect(links().map((a) => a.textContent?.trim())).toEqual(['Journée', 'Résultats', 'Classement']);
  });

  it('pointe vers les bonnes routes', async () => {
    await harness.navigateByUrl('/journee');
    expect(links().map((a) => a.getAttribute('href'))).toEqual(['/journee', '/resultats', '/classement']);
  });

  it('a un libellé accessible', async () => {
    await harness.navigateByUrl('/journee');
    const nav = harness.fixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Navigation principale');
  });

  it.each([
    ['/journee', 'Journée'],
    ['/journee/3', 'Journée'],
    ['/resultats/1', 'Résultats'],
    ['/resultats/3', 'Résultats'],
    ['/classement', 'Classement'],
  ])('sur "%s", seul le lien « %s » porte aria-current="page"', async (url, label) => {
    await harness.navigateByUrl(url);
    const current = links().filter((a) => a.getAttribute('aria-current') === 'page');
    expect(current.map((a) => a.textContent?.trim())).toEqual([label]);
  });
});
