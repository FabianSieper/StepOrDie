import { Routes } from '@angular/router';
import { GamePageContainer } from './game-page/game-page.container';
import { LandingPageContainer } from './landing-page/landing-page.container';

export const routes: Routes = [
  { path: '', component: LandingPageContainer },
  { path: 'game/:gameId', component: GamePageContainer },
];
