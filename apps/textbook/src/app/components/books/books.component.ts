import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookSidebarComponent } from './book-sidebar/book-sidebar.component';
import { EditorComponent } from './editor/editor.component';
import { TocSidebarComponent } from './toc-sidebar/toc-sidebar.component';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, BookSidebarComponent, EditorComponent, TocSidebarComponent],
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css']
})
export class BooksComponent {
  editorContent: string = '';

  onEditorContentChange(content: string): void {
    this.editorContent = content;
  }
}
