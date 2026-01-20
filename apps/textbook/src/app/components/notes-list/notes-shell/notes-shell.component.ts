import { Component } from '@angular/core';
import { NotesSidebarComponent } from '../notes-sidebar/notes-sidebar.component';
import { NotesListComponent } from '../notes-list/notes-list.component';

@Component({
  selector: 'app-notes-shell',
  standalone: true,
  imports: [NotesSidebarComponent, NotesListComponent],
  templateUrl: './notes-shell.component.html',
  styleUrls: ['./notes-shell.component.css']
})
export class NotesShellComponent {}
