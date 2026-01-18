import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
  selectedLabelId: string | null = null;

  @Output() labelSelected = new EventEmitter<string | null>();
  @Output() openLabelManager = new EventEmitter<void>();

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

  selectHome() {
    this.selectedLabelId = null;
    this.labelSelected.emit(null);
  }

  selectLabel(labelId: string) {
    this.selectedLabelId = labelId;
    this.labelSelected.emit(labelId);
  }

  onEditLabels() {
    this.openLabelManager.emit();
  }
}
