import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../services/notes.service';
import { Note, NoteLabel } from '../../models/types';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.css'
})
export class NotesListComponent implements OnInit {
  @ViewChild('titleInput') titleInput!: ElementRef;

  notes: Note[] = [];
  filteredNotes: Note[] = [];
  searchQuery = '';
  labels: NoteLabel[] = []; // Store fetched labels
  
  showModal = false;
  editingNote: Note | null = null;
  formData: Partial<Note> = {
    title: '',
    content: '',
    is_favorite: false,
    images: [] // Keep for existing images
  };
  
  selectedFile: File | null = null; // New file to upload
  imagePreview: string | null = null; // Preview of new file

  expandedImage: string | null = null; // Lightbox state

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
    if (!this.searchQuery.trim()) {
      this.filteredNotes = this.notes;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredNotes = this.notes.filter(note => 
        note.title?.toLowerCase().includes(query) || 
        note.content?.toLowerCase().includes(query)
      );
    }
  }

  openCreateModal(): void {
    this.editingNote = null;
    this.formData = { title: '', content: '', is_favorite: false, images: [] };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
    
    // Auto-focus title
    setTimeout(() => {
      this.titleInput?.nativeElement.focus();
    }, 100);
  }

  openEditModal(note: Note): void {
    this.editingNote = note;
    this.formData = {
      title: note.title,
      content: note.content,
      is_favorite: note.is_favorite,
      images: note.images ? [...note.images] : [],
      label: note.label // Load existing label
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingNote = null;
    this.formData = { title: '', content: '', is_favorite: false, images: [] };
    this.selectedFile = null;
    this.imagePreview = null;
  }
  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  async saveNote(): Promise<void> {
    if (!this.formData.content?.trim() && !this.formData.title?.trim() && !this.selectedFile) return; 
    
    try {
      let payload: any;

      if (this.selectedFile) {
        // Use FormData if sending a file
        payload = new FormData();
        payload.append('title', this.formData.title || '');
        payload.append('content', this.formData.content || '');
        payload.append('is_favorite', String(this.formData.is_favorite));
        if (this.formData.label) {
            payload.append('label', this.formData.label);
        }
        // Append new file
        payload.append('images', this.selectedFile);

        // For updates, we might need to handle keeping existing images separately depending on PB version/logic
        // PB replaces files if same field is used in update without special handling usually, 
        // but typically 'images' is multi-file.
        // For simplicity in this iteration: if new file, it adds to/replaces based on API.
        // Ideally we append existing images IDs if PB supports that in FormData mixing, but typically standard FormData upload involves sending the file.
        // Let's assume uploading ONE new image for now as requested.
      } else {
        // JSON Payload
        payload = { ...this.formData };
        if (!payload.images || payload.images.length === 0) delete payload.images;
        if (!payload.label) delete payload.label;
      }

      if (this.editingNote) {
        await this.notesService.update(this.editingNote.id, payload);
      } else {
        await this.notesService.create(payload);
      }
      this.closeModal();
      await this.loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
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
}
