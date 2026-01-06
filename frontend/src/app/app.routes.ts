import { Routes } from '@angular/router';
import { GamePageContainer } from './game-page/game-page.container';
import { LandingPageContainer } from './landing-page/landing-page.container';
import { FeedbackPageContainer } from './feedback-page/feedback-page.container';

export const routes: Routes = [
  { path: '', component: LandingPageContainer },
  { path: 'game/:gameId', component: GamePageContainer },
  { path: 'feedback', component: FeedbackPageContainer },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
