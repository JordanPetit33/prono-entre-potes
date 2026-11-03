import { Routes } from '@angular/router';
import { MatchdayPage } from './matchday/matchday-page';
import { PlayersPage } from './players/players-page';
import { ResultsPage } from './results/results-page';
import { StandingsPage } from './standings/standings-page';

export const routes: Routes = [
  { path: '', redirectTo: 'journee', pathMatch: 'full' },
  { path: 'journee', component: MatchdayPage, title: 'Journée · Prono entre potes' },
  { path: 'journee/:numero', component: MatchdayPage, title: 'Journée · Prono entre potes' },
  { path: 'resultats/:numero', component: ResultsPage, title: 'Résultats · Prono entre potes' },
  { path: 'classement', component: StandingsPage, title: 'Classement · Prono entre potes' },
  { path: 'joueurs', component: PlayersPage, title: 'Joueurs · Prono entre potes' },
  { path: '**', redirectTo: 'journee' },
];
