import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'notes',
    pathMatch: 'full'
  },
  {
    path: 'notes',
    loadComponent: () => import('./components/notes-list/notes-list.component')
      .then(m => m.NotesListComponent),
    title: 'Notes - TaskNote Manager'
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/task-board/task-board.component')
      .then(m => m.TaskBoardComponent),
    title: 'Tasks - TaskNote Manager'
  },
  {
    path: '**',
    redirectTo: 'notes'
  }
];
