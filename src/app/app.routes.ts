import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { defaultMatchday } from './core/scoring/default-matchday';
import { AppStore } from './core/state/app-store';
import { Clock } from './core/time/clock';
import { MatchdayPage } from './matchday/matchday-page';
import { PlayersPage } from './players/players-page';
import { ResultsPage } from './results/results-page';
import { StandingsPage } from './standings/standings-page';

/** Redirige vers la journée par défaut (F-72), sous le chemin donné. */
function toDefaultMatchday(path: string): () => string {
  return () => {
    const store = inject(AppStore);
    const matchday = defaultMatchday(store.matches(), store.results(), inject(Clock).now());
    return `/${path}/${matchday}`;
  };
}

export const routes: Routes = [
  { path: '', redirectTo: toDefaultMatchday('journee'), pathMatch: 'full' },
  { path: 'journee', redirectTo: toDefaultMatchday('journee'), pathMatch: 'full' },
  { path: 'journee/:numero', component: MatchdayPage, title: 'Journée · Prono entre potes' },
  { path: 'resultats', redirectTo: toDefaultMatchday('resultats'), pathMatch: 'full' },
  { path: 'resultats/:numero', component: ResultsPage, title: 'Résultats · Prono entre potes' },
  { path: 'classement', component: StandingsPage, title: 'Classement · Prono entre potes' },
  { path: 'joueurs', component: PlayersPage, title: 'Joueurs · Prono entre potes' },
  { path: '**', redirectTo: toDefaultMatchday('journee') },
];
