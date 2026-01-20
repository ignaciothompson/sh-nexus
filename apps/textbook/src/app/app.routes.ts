import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { NotesShellComponent } from './components/notes-list/notes-shell/notes-shell.component';
import { PlannerShellComponent } from './components/task-board/planner-shell/planner-shell.component';
import { BooksComponent } from './components/books/books-shell/books.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'notes', pathMatch: 'full' },
      { path: 'notes', component: NotesShellComponent },
      { path: 'books', component: BooksComponent },
      { path: 'planner', component: PlannerShellComponent }
    ]
  },
  {
    path: '**',
    redirectTo: 'notes'
  }
];
