import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NetworkComponent } from './components/network/network.component';
import { MediaComponent } from './components/media/media.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { NotesComponent } from './components/notes/notes.component';
import { CodeComponent } from './components/code/code.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: DashboardComponent },
      { path: 'dashboard', redirectTo: 'home', pathMatch: 'full' }, // Legacy redirect
      { path: 'network', component: NetworkComponent },
      { path: 'media', component: MediaComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'notes', component: NotesComponent },
      { path: 'code', component: CodeComponent }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
