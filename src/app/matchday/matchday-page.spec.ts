import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
});
