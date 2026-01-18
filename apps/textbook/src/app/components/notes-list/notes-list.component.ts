import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../services/notes.service';
import { Note, NoteLabel, TodoItem, NoteType } from '../../models/types';

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
  selectedLabelId: string | null = null; // NEW: for filtering by label
  labels: NoteLabel[] = [];
  
  showModal = false;
  editingNote: Note | null = null;
  formData: Partial<Note> = {
    title: '',
    content: '',
    is_favorite: false,
    images: [],
    note_type: 'text',
    todo_items: []
  };
  
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  expandedImage: string | null = null;

  // Label management
  showLabelModal = false;
  showLabelManagerModal = false;
  showInlineLabelCreate = false; // NEW: for inline label creation in modal
  newLabelName = '';
  newLabelColor = '#9c33ff';
  editingLabel: NoteLabel | null = null;

  // Todo management
  newTodoText = '';

  labelColors = [
    { name: 'Purple', value: '#9c33ff' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' }
  ];

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
    this.formData = { 
      title: '', 
      content: '', 
      is_favorite: false, 
      images: [],
      note_type: 'text',
      todo_items: []
    };
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
      label: note.label,
      note_type: note.note_type || 'text',
      todo_items: note.todo_items ? JSON.parse(JSON.stringify(note.todo_items)) : []
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingNote = null;
    this.formData = { 
      title: '', 
      content: '', 
      is_favorite: false, 
      images: [],
      note_type: 'text',
      todo_items: []
    };
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
    if (!this.formData.content?.trim() && !this.formData.title?.trim() && !this.selectedFile && (!this.formData.todo_items || this.formData.todo_items.length === 0)) return; 
    
    try {
      let payload: any;

      if (this.selectedFile) {
        // Use FormData if sending a file
        payload = new FormData();
        payload.append('title', this.formData.title || '');
        payload.append('content', this.formData.content || '');
        payload.append('is_favorite', String(this.formData.is_favorite));
        payload.append('note_type', this.formData.note_type || 'text');
        
        if (this.formData.label) {
          payload.append('label', this.formData.label);
        }
        
        // Add todo items if present
        if (this.formData.todo_items && this.formData.todo_items.length > 0) {
          payload.append('todo_items', JSON.stringify(this.formData.todo_items));
        }
        
        // Append new file
        payload.append('images', this.selectedFile);
      } else {
        // JSON Payload
        payload = { ...this.formData };
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
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      // Always close modal
      this.closeModal();
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

  // Todo List Management
  addTodoItem(): void {
    if (this.newTodoText.trim()) {
      const newItem: TodoItem = {
        id: Date.now().toString(),
        text: this.newTodoText.trim(),
        completed: false
      };
      this.formData.todo_items = [...(this.formData.todo_items || []), newItem];
      this.newTodoText = '';
    }
  }

  toggleTodoItem(item: TodoItem): void {
    item.completed = !item.completed;
  }

  removeTodoItem(itemId: string): void {
    this.formData.todo_items = this.formData.todo_items?.filter(item => item.id !== itemId);
  }

  getTodoProgress(note: Note): number {
    if (!note.todo_items || note.todo_items.length === 0) return 0;
    const completed = note.todo_items.filter(item => item.completed).length;
    return Math.round((completed / note.todo_items.length) * 100);
  }

  getTodoCompletedCount(note: Note): number {
    if (!note.todo_items) return 0;
    return note.todo_items.filter(item => item.completed).length;
  }

  // Label Management
  openLabelManager(): void {
    this.showLabelManagerModal = true;
  }

  closeLabelManager(): void {
    this.showLabelManagerModal = false;
    this.editingLabel = null;
    this.newLabelName = '';
    this.newLabelColor = '#9c33ff';
  }

  toggleInlineLabelCreate(): void {
    this.showInlineLabelCreate = !this.showInlineLabelCreate;
    if (this.showInlineLabelCreate) {
      this.newLabelName = '';
      this.newLabelColor = '#9c33ff';
    }
  }

  async createLabel(): Promise<void> {
    if (!this.newLabelName.trim()) return;
    
    try {
      const newLabel = await this.notesService.createLabel({
        name: this.newLabelName.trim(),
        color: this.newLabelColor
      });
      await this.loadLabels();
      
      // Auto-select the newly created label
      if (this.showInlineLabelCreate) {
        this.formData.label = newLabel.id;
        this.showInlineLabelCreate = false;
      }
      
      this.newLabelName = '';
      this.newLabelColor = '#9c33ff';
    } catch (error) {
      console.error('Error creating label:', error);
    }
  }

  async deleteLabel(labelId: string): Promise<void> {
    if (!confirm('Delete this label? Notes with this label will not be deleted.')) return;
    
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
