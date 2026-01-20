import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note, NoteLabel, TodoItem, NoteType } from '../../../models/types';

@Component({
  selector: 'app-note-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-create-modal.component.html',
  styleUrls: ['./note-create-modal.component.css']
})
export class NoteCreateModalComponent implements OnInit, OnChanges {
  @Input() note: Note | null = null; // If provided, we're editing
  @Input() set labels(value: NoteLabel[]) {
    this._labels = value;
  }
  get labels(): NoteLabel[] {
    return this._labels;
  }
  private _labels: NoteLabel[] = [];
  
  @Output() save = new EventEmitter<{ note: Partial<Note>; file?: File }>();
  @Output() close = new EventEmitter<void>();
  @Output() createLabel = new EventEmitter<{ name: string; color: string }>();

  @ViewChild('titleInput') titleInput!: ElementRef;

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
  isSaving = false;
  showInlineLabelCreate = false;
  newLabelName = '';
  newLabelColor = '#9c33ff';
  newTodoText = '';
  pendingLabelName: string | null = null; // Track label being created to auto-select it

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

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.note) {
      // Editing existing note
      this.formData = {
        title: this.note.title,
        content: this.note.content,
        is_favorite: this.note.is_favorite,
        images: this.note.images ? [...this.note.images] : [],
        label: this.note.label,
        note_type: this.note.note_type || 'text',
        todo_items: this.note.todo_items ? JSON.parse(JSON.stringify(this.note.todo_items)) : []
      };
    }

    // Auto-focus title
    setTimeout(() => {
      this.titleInput?.nativeElement.focus();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Auto-select newly created label
    if (changes['labels'] && this.pendingLabelName && this.labels.length > 0) {
      const newLabel = this.labels.find(l => l.name === this.pendingLabelName);
      if (newLabel) {
        this.formData.label = newLabel.id;
        this.pendingLabelName = null;
      }
    }
  }

  onClose(): void {
    if (this.isSaving) return;
    this.close.emit();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onSave(): void {
    if (this.isSaving) return;

    // Validate that there's content to save
    if (!this.formData.content?.trim() && !this.formData.title?.trim() && !this.selectedFile && 
        (!this.formData.todo_items || this.formData.todo_items.length === 0)) {
      return;
    }

    this.isSaving = true;
    this.save.emit({ note: this.formData, file: this.selectedFile || undefined });
    
    // Reset saving state after a delay (parent will close modal on success)
    setTimeout(() => {
      this.isSaving = false;
    }, 500);
  }

  toggleInlineLabelCreate(): void {
    this.showInlineLabelCreate = !this.showInlineLabelCreate;
    if (this.showInlineLabelCreate) {
      this.newLabelName = '';
      this.newLabelColor = '#9c33ff';
    }
  }

  onCreateLabel(): void {
    if (!this.newLabelName.trim()) return;
    const labelName = this.newLabelName.trim();
    this.pendingLabelName = labelName; // Track for auto-selection
    this.createLabel.emit({
      name: labelName,
      color: this.newLabelColor
    });
    this.showInlineLabelCreate = false;
    this.newLabelName = '';
    this.newLabelColor = '#9c33ff';
  }

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
}
