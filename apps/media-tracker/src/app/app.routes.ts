import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'movies',
    loadComponent: () => import('./components/movies/movies.component').then(m => m.MoviesComponent)
  },
  {
    path: 'series',
    loadComponent: () => import('./components/series/series.component').then(m => m.SeriesComponent)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./components/calendar/calendar.component').then(m => m.CalendarComponent)
  },
  {
    path: 'stats',
    loadComponent: () => import('./components/stats/stats.component').then(m => m.StatsComponent)
  },
  {
    path: 'details/:type/:id',
    loadComponent: () => import('./components/details/details').then(m => m.DetailsComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
