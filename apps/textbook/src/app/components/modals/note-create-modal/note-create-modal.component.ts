import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Note, NoteLabel, TodoItem, NoteType } from '../../../models/types';

/** Data passed to the NoteCreateModal dialog */
export interface NoteCreateDialogData {
  note: Note | null;
  labels: NoteLabel[];
}

/** Result returned from the NoteCreateModal dialog */
export interface NoteCreateDialogResult {
  action: 'save' | 'createLabel';
  note?: Partial<Note>;
  file?: File;
  labelName?: string;
  labelColor?: string;
}

@Component({
  selector: 'app-note-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-create-modal.component.html',
  styleUrls: ['./note-create-modal.component.css']
})
export class NoteCreateModalComponent implements OnInit {
  private dialogRef = inject(DialogRef<NoteCreateDialogResult | undefined>);
  private data = inject<NoteCreateDialogData>(DIALOG_DATA);

  @ViewChild('titleInput') titleInput!: ElementRef;

  note: Note | null = null;
  labels: NoteLabel[] = [];

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
    this.note = this.data.note;
    this.labels = this.data.labels;

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

  onClose(): void {
    if (this.isSaving) return;
    this.dialogRef.close();
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
    this.dialogRef.close({ 
      action: 'save', 
      note: this.formData, 
      file: this.selectedFile || undefined 
    });
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
    this.dialogRef.close({
      action: 'createLabel',
      labelName: this.newLabelName.trim(),
      labelColor: this.newLabelColor
    });
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
