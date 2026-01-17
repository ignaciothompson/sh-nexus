import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesService } from '../../../services/notes.service';
import { NoteLabel } from '../../../models/types';

@Component({
  selector: 'app-notes-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notes-sidebar.component.html',
  styleUrls: ['./notes-sidebar.component.css']
})
export class NotesSidebarComponent implements OnInit {
  labels: NoteLabel[] = [];

  constructor(private notesService: NotesService) {}

  ngOnInit() {
    this.loadLabels();
  }

  async loadLabels() {
    try {
      this.labels = await this.notesService.getLabels();
    } catch (error) {
      console.error('Error loading labels:', error);
    }
  }
}
