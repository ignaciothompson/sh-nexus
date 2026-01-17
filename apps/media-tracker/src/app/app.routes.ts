import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { DetailsComponent } from './components/details/details';
import { ChatPageComponent } from './components/chat-page/chat-page';
import { MetricsComponent } from './components/metrics/metrics';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'details/:type/:id', component: DetailsComponent },
  { path: 'chat', component: ChatPageComponent },
  { path: 'metrics', component: MetricsComponent },
  { path: '**', redirectTo: '' }
];
