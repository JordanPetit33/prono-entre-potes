import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatchdayHeader } from './matchday-header';

describe('MatchdayHeader', () => {
  let fixture: ComponentFixture<MatchdayHeader>;
  let navigations: number[];

  async function render(inputs: {
    matchday: number;
    previous: number | null;
    next: number | null;
    progress?: { done: number; total: number } | null;
    standing?: { rank: number; points: number; gap: string | null } | null;
    competition?: string | null;
  }): Promise<void> {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(MatchdayHeader);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    navigations = [];
    fixture.componentInstance.navigate.subscribe((n) => navigations.push(n));
    await fixture.whenStable();
  }

  const el = (): HTMLElement => fixture.nativeElement;
  const button = (label: string): HTMLButtonElement => el().querySelector(`button[aria-label="${label}"]`)!;

  it('affiche « Journée <n> »', async () => {
    await render({ matchday: 12, previous: 11, next: 13 });
    expect(el().querySelector('h2')?.textContent?.trim()).toBe('Journée 12');
  });

  describe('nom de la compétition (F-01)', () => {
    const competition = (): string | undefined =>
      el().querySelector('[data-testid="competition-name"]')?.textContent?.trim();

    it('affiche le nom de la compétition', async () => {
      await render({ matchday: 1, previous: null, next: null, competition: 'Ligue 1' });
      expect(competition()).toBe('Ligue 1');
    });

    it('est masqué sans nom', async () => {
      await render({ matchday: 1, previous: null, next: null });
      expect(competition()).toBeUndefined();
    });
  });

  it('a des boutons « Journée précédente » et « Journée suivante »', async () => {
    await render({ matchday: 2, previous: 1, next: 3 });
    expect(button('Journée précédente')).not.toBeNull();
    expect(button('Journée suivante')).not.toBeNull();
  });

  it('les flèches demandent la journée précédente ou suivante', async () => {
    await render({ matchday: 2, previous: 1, next: 5 });
    button('Journée précédente').click();
    button('Journée suivante').click();
    expect(navigations).toEqual([1, 5]);
  });

  it('désactive « Journée précédente » à la première journée', async () => {
    await render({ matchday: 1, previous: null, next: 2 });
    expect(button('Journée précédente').disabled).toBe(true);
    expect(button('Journée suivante').disabled).toBe(false);
  });

  it('désactive « Journée suivante » à la dernière journée', async () => {
    await render({ matchday: 3, previous: 2, next: null });
    expect(button('Journée suivante').disabled).toBe(true);
    expect(button('Journée précédente').disabled).toBe(false);
  });

  describe('compteur', () => {
    it('affiche « <done> / <total> » et une barre de progression', async () => {
      await render({ matchday: 1, previous: null, next: null, progress: { done: 7, total: 9 } });
      expect(el().querySelector('[data-testid="progress-count"]')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
        '7 / 9',
      );
      const bar = el().querySelector('[role="progressbar"]')!;
      expect(bar.getAttribute('aria-valuenow')).toBe('7');
      expect(bar.getAttribute('aria-valuemax')).toBe('9');
      expect(bar.getAttribute('aria-label')).toBe('Pronostics saisis');
    });

    it('est masqué sans progression', async () => {
      await render({ matchday: 1, previous: null, next: null });
      expect(el().querySelector('[role="progressbar"]')).toBeNull();
    });
  });

  describe('classement du joueur actif (F-62)', () => {
    const standing = (): HTMLAnchorElement | null => el().querySelector('a[data-testid="standing"]');
    const text = (): string | undefined => standing()?.textContent?.replace(/\s+/g, ' ').trim();

    it('affiche le rang, les points et l’écart, avec un lien vers le classement', async () => {
      await render({ matchday: 1, previous: null, next: null, standing: { rank: 2, points: 41, gap: '3 pts derrière Léa' } });
      expect(standing()?.getAttribute('href')).toBe('/classement');
      expect(text()).toContain('2e · 41 pts');
      expect(text()).toContain('3 pts derrière Léa');
    });

    it('n’affiche pas d’écart pour le premier', async () => {
      await render({ matchday: 1, previous: null, next: null, standing: { rank: 1, points: 1, gap: null } });
      expect(text()).toBe('Classement 1er · 1 pt');
    });

    it('est masqué sans classement', async () => {
      await render({ matchday: 1, previous: null, next: null });
      expect(standing()).toBeNull();
    });
  });
});
