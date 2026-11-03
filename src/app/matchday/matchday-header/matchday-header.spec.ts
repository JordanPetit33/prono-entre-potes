import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchdayHeader } from './matchday-header';

describe('MatchdayHeader', () => {
  let fixture: ComponentFixture<MatchdayHeader>;
  let navigations: number[];

  async function render(inputs: {
    matchday: number;
    previous: number | null;
    next: number | null;
    progress?: { done: number; total: number } | null;
  }): Promise<void> {
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
});
