import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesService } from '../../../services/notes.service';
import { Note, NoteLabel, TodoItem, NoteType } from '../../../models/types';
import { NoteCreateModalComponent } from '../../modals/note-create-modal/note-create-modal.component';
import { LabelManagerModalComponent } from '../../modals/label-manager-modal/label-manager-modal.component';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, NoteCreateModalComponent, LabelManagerModalComponent],
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.css'
})
export class NotesListComponent implements OnInit {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  searchQuery = '';
  selectedLabelId: string | null = null;
  labels: NoteLabel[] = [];
  
  showModal = false;
  editingNote: Note | null = null;
  showLabelManagerModal = false;

  private isLoading = false;

  constructor(
    private notesService: NotesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotes();
    this.loadLabels();
  }

  async loadLabels() {
    try {
      this.labels = await this.notesService.getLabels();
    } catch (error) {
      console.error('Error loading labels:', error);
    }
  }

  async loadNotes(): Promise<void> {
    if (this.isLoading) return; 
    this.isLoading = true;
    
    try {
      const notes = await this.notesService.getAll();
      this.notes = [...notes]; // Create new array reference
      this.filterNotes();
      this.cdr.detectChanges(); 
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      this.isLoading = false;
    }
  }

  filterNotes(): void {
    let filtered = this.notes;

    // Filter by label
    if (this.selectedLabelId) {
      filtered = filtered.filter(note => note.label === this.selectedLabelId);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title?.toLowerCase().includes(query) || 
        note.content?.toLowerCase().includes(query)
      );
    }

    this.filteredNotes = filtered;
  }

  onLabelSelected(labelId: string | null): void {
    this.selectedLabelId = labelId;
    this.filterNotes();
  }

  onOpenLabelManager(): void {
    this.openLabelManager();
  }

  openCreateModal(): void {
    this.editingNote = null;
    this.showModal = true;
  }

  openEditModal(note: Note): void {
    this.editingNote = note;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingNote = null;
  }

  async onSaveNote(event: { note: Partial<Note>; file?: File }): Promise<void> {
    try {
      let payload: any;

      if (event.file) {
        // Use FormData if sending a file
        payload = new FormData();
        payload.append('title', event.note.title || '');
        payload.append('content', event.note.content || '');
        payload.append('is_favorite', String(event.note.is_favorite || false));
        payload.append('note_type', event.note.note_type || 'text');
        
        if (event.note.label) {
          payload.append('label', event.note.label);
        }
        
        // Add todo items if present
        if (event.note.todo_items && event.note.todo_items.length > 0) {
          payload.append('todo_items', JSON.stringify(event.note.todo_items));
        }
        
        // Append new file
        payload.append('images', event.file);
      } else {
        // JSON Payload
        payload = { ...event.note };
        if (!payload.images || payload.images.length === 0) delete payload.images;
        if (!payload.label) delete payload.label;
        if (!payload.todo_items || payload.todo_items.length === 0) delete payload.todo_items;
      }

      if (this.editingNote) {
        await this.notesService.update(this.editingNote.id, payload);
      } else {
        await this.notesService.create(payload);
      }
      await this.loadNotes();
      this.closeModal();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }

  async onCreateLabel(event: { name: string; color: string }): Promise<void> {
    try {
      await this.notesService.createLabel({
        name: event.name,
        color: event.color
      });
      await this.loadLabels();
    } catch (error) {
      console.error('Error creating label:', error);
    }
  }

  async togglePin(note: Note): Promise<void> {
    try {
      await this.notesService.toggleFavorite(note.id, !note.is_favorite);
      // Optimistically update UI
      note.is_favorite = !note.is_favorite;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      await this.loadNotes(); 
    }
  }

  async deleteNote(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      this.notes = this.notes.filter(n => n.id !== id);
      this.filterNotes();
      this.cdr.detectChanges();
      
      await this.notesService.delete(id);
    } catch (error) {
      console.error('Error deleting note:', error);
      await this.loadNotes(); 
    }
  }


  getTodoProgress(note: Note): number {
    if (!note.todo_items || note.todo_items.length === 0) return 0;
    const completed = note.todo_items.filter((item: TodoItem) => item.completed).length;
    return Math.round((completed / note.todo_items.length) * 100);
  }

  getTodoCompletedCount(note: Note): number {
    if (!note.todo_items) return 0;
    return note.todo_items.filter((item: TodoItem) => item.completed).length;
  }

  // Label Management
  openLabelManager(): void {
    this.showLabelManagerModal = true;
  }

  closeLabelManager(): void {
    this.showLabelManagerModal = false;
  }

  async onDeleteLabel(labelId: string): Promise<void> {
    try {
      await this.notesService.deleteLabel(labelId);
      await this.loadLabels();
      await this.loadNotes(); // Refresh notes to update UI
    } catch (error) {
      console.error('Error deleting label:', error);
    }
  }

  getLabelColor(note: Note): string {
    if (note.expand?.label?.color) {
      return note.expand.label.color;
    }
    return '#9c33ff'; // Default purple
  }

  getLabelName(note: Note): string {
    if (note.expand?.label?.name) {
      return note.expand.label.name;
    }
    return '';
  }

  getImageUrl(note: Note, filename: string): string {
    return this.notesService['pbService'].client.files.getUrl(note, filename, { thumb: '200x200' });
  }
}
