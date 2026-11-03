import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AppStore } from './core/state/app-store';
import { DATA_KEY } from './core/storage/storage-repository';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('affiche le titre « Prono entre potes »', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Prono entre potes');
  });

  it('contient un router-outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('affiche la barre de navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-bottom-nav nav')).not.toBeNull();
  });

  it('n’affiche pas le sélecteur de joueur sans joueur', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header app-player-picker')).toBeNull();
  });

  it('affiche le sélecteur de joueur dans l’en-tête dès qu’un joueur existe', async () => {
    TestBed.inject(AppStore).addPlayer('Karim');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header app-player-picker')?.textContent).toContain('Karim');
  });

  it('données illisibles : l’écran d’erreur remplace le contenu et la navigation', async () => {
    window.localStorage.setItem(DATA_KEY, '{pas du json');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-storage-error-screen')).not.toBeNull();
    expect(compiled.querySelector('router-outlet')).toBeNull();
    expect(compiled.querySelector('app-bottom-nav')).toBeNull();
  });

  it('affiche le bandeau de stockage au-dessus du contenu', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-storage-banner')).not.toBeNull();
    expect(compiled.querySelector('app-storage-error-screen')).toBeNull();
  });
});
