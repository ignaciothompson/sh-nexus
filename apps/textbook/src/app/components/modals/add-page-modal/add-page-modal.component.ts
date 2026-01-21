import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Book } from '../../../models/types';

export interface NewPageData {
  bookId: string;
  title: string;
  icon: string;
}

/** Data passed to the AddPageModal dialog */
export interface AddPageDialogData {
  books: Book[];
  selectedBookId?: string;
  suggestedTitle?: string;
}

@Component({
  selector: 'app-add-page-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-page-modal.component.html',
  styleUrls: ['./add-page-modal.component.css']
})
export class AddPageModalComponent implements OnInit {
  private dialogRef = inject(DialogRef<NewPageData | undefined>);
  private data = inject<AddPageDialogData>(DIALOG_DATA);

  books: Book[] = [];
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
    // Initialize from dialog data
    this.books = this.data.books;
    
    if (this.data.selectedBookId) {
      this.bookId = this.data.selectedBookId;
    }
    if (this.data.suggestedTitle) {
      this.title = this.data.suggestedTitle;
    }
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.bookId && this.title.trim()) {
      this.dialogRef.close({
        bookId: this.bookId,
        title: this.title.trim(),
        icon: this.selectedIcon
      });
    }
  }
}
