import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/types';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.css'
})
export class NotesListComponent implements OnInit {
  notes: Note[] = [];
  showModal = false;
  editingNote: Note | null = null;
  formData = {
    title: '',
    content: '',
    isMarked: false
  };
  private isLoading = false;

  constructor(
    private notesService: NotesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  async loadNotes(): Promise<void> {
    if (this.isLoading) return; // Prevent concurrent loads
    this.isLoading = true;
    
    try {
      const notes = await this.notesService.getAll();
      this.notes = [...notes]; // Create new array reference
      this.cdr.detectChanges(); // Force change detection
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      this.isLoading = false;
    }
  }

  openCreateModal(): void {
    this.editingNote = null;
    this.formData = { title: '', content: '', isMarked: false };
    this.showModal = true;
  }

  openEditModal(note: Note): void {
    this.editingNote = note;
    this.formData = {
      title: note.title,
      content: note.content,
      isMarked: note.isMarked
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingNote = null;
    this.formData = { title: '', content: '', isMarked: false };
  }

  async saveNote(): Promise<void> {
    if (!this.formData.title.trim()) return; // Prevent empty saves
    
    try {
      if (this.editingNote) {
        await this.notesService.update(this.editingNote.id, this.formData);
      } else {
        await this.notesService.create(this.formData);
      }
      this.closeModal();
      await this.loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }

  async toggleMark(note: Note): Promise<void> {
    try {
      await this.notesService.toggleMark(note.id, !note.isMarked);
      // Optimistically update UI
      note.isMarked = !note.isMarked;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error toggling mark:', error);
      await this.loadNotes(); // Reload on error
    }
  }

  async deleteNote(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      // Optimistically remove from UI first
      this.notes = this.notes.filter(n => n.id !== id);
      this.cdr.detectChanges();
      
      await this.notesService.delete(id);
    } catch (error) {
      console.error('Error deleting note:', error);
      await this.loadNotes(); // Reload on error to restore state
    }
  }
}
