import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book } from '../../../models/types';

export interface NewPageData {
  bookId: string;
  title: string;
  icon: string;
}

@Component({
  selector: 'app-add-page-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-page-modal.component.html',
  styleUrls: ['./add-page-modal.component.css']
})
export class AddPageModalComponent {
  @Input() books: Book[] = [];
  @Input() selectedBookId?: string;
  @Input() suggestedTitle?: string;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<NewPageData>();

  bookId = '';
  title = '';
  selectedIcon = 'description';
  
  iconOptions = [
    { name: 'Article', icon: 'article' },
    { name: 'Description', icon: 'description' },
    { name: 'Note', icon: 'note' },
    { name: 'Assignment', icon: 'assignment' },
    { name: 'Task', icon: 'task' },
    { name: 'List', icon: 'list' },
    { name: 'Lightbulb', icon: 'lightbulb' },
    { name: 'Code', icon: 'code' }
  ];

  ngOnInit(): void {
    if (this.selectedBookId) {
      this.bookId = this.selectedBookId;
    }
    if (this.suggestedTitle) {
      this.title = this.suggestedTitle;
    }
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.bookId && this.title.trim()) {
      this.save.emit({
        bookId: this.bookId,
        title: this.title.trim(),
        icon: this.selectedIcon
      });
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
