import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { NotesShellComponent } from './components/notes-list/notes-shell.component';
import { PlannerShellComponent } from './components/task-board/planner-shell.component';
import { BooksComponent } from './components/books/books.component';
import { HomeDashboardComponent } from './components/home-dashboard/home-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: HomeDashboardComponent },
      { path: 'notes', component: NotesShellComponent },
      { path: 'books', component: BooksComponent },
      { path: 'planner', component: PlannerShellComponent }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
