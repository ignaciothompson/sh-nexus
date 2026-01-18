import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { BooksService } from '../../../services/books.service';
import { Book, Page } from '../../../models/types';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, TiptapEditorDirective],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, OnDestroy {
  @Output() contentChange = new EventEmitter<string>();
  
  pageTitle = '';
  bookName = '';
  createdDate = '';
  readTime = '0 min read';
  tags: string[] = [];
  
  editor!: Editor;
  editorContent = '<p>Select a page to start editing...</p>';
  currentPage: Page | null = null;
  currentBook: Book | null = null;
  
  private subscription = new Subscription();
  private contentChangeSubject = new Subject<string>();

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    // Initialize editor
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'editor-link',
          },
        }),
        Image.configure({
          HTMLAttributes: {
            class: 'editor-image',
          },
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Highlight.configure({
          multicolor: true,
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        Placeholder.configure({
          placeholder: 'Type "/" for commands or start writing...',
        }),
      ],
      content: this.editorContent,
      editorProps: {
        attributes: {
          class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px]',
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        this.contentChangeSubject.next(html);
        this.contentChange.emit(html);
      },
    });

    // Auto-save with debounce
    this.subscription.add(
      this.contentChangeSubject.pipe(
        debounceTime(1000),
        distinctUntilChanged()
      ).subscribe((content) => {
        if (this.currentPage && content !== this.currentPage.content) {
          this.savePageContent(content);
        }
      })
    );

    // Subscribe to current page
    this.subscription.add(
      this.booksService.currentPage$.subscribe((page) => {
        if (page) {
          this.currentPage = page;
          this.pageTitle = page.title;
          this.editorContent = page.content || '<p>Start writing...</p>';
          
          if (this.editor) {
            this.editor.commands.setContent(this.editorContent);
          }

          // Calculate read time
          const wordCount = this.calculateWordCount(page.content);
          this.readTime = `${Math.ceil(wordCount / 200)} min read`;
          
          // Format date
          this.createdDate = new Date(page.created).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        }
      })
    );

    // Subscribe to current book
    this.subscription.add(
      this.booksService.currentBook$.subscribe((book) => {
        if (book) {
          this.currentBook = book;
          this.bookName = book.title;
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
    this.subscription.unsubscribe();
  }

  async savePageContent(content: string): Promise<void> {
    if (!this.currentPage) return;

    try {
      await this.booksService.updatePage(this.currentPage.id, { content });
      console.log('Page content saved');
    } catch (error) {
      console.error('Error saving page:', error);
    }
  }

  async savePageTitle(): Promise<void> {
    if (!this.currentPage || !this.pageTitle.trim()) return;

    try {
      await this.booksService.updatePage(this.currentPage.id, { 
        title: this.pageTitle.trim() 
      });
      console.log('Page title saved');
    } catch (error) {
      console.error('Error saving title:', error);
    }
  }

  formatText(format: string): void {
    if (!this.editor) return;

    switch (format) {
      case 'bold':
        this.editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        this.editor.chain().focus().toggleItalic().run();
        break;
      case 'underline':
        this.editor.chain().focus().toggleUnderline().run();
        break;
      case 'strikethrough':
        this.editor.chain().focus().toggleStrike().run();
        break;
      case 'code':
        this.editor.chain().focus().toggleCode().run();
        break;
      case 'codeBlock':
        this.editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'highlight':
        this.editor.chain().focus().toggleHighlight().run();
        break;
      case 'h1':
        this.editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'h2':
        this.editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'h3':
        this.editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'bulletList':
        this.editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        this.editor.chain().focus().toggleOrderedList().run();
        break;
      case 'taskList':
        this.editor.chain().focus().toggleTaskList().run();
        break;
      case 'blockquote':
        this.editor.chain().focus().toggleBlockquote().run();
        break;
      case 'alignLeft':
        this.editor.chain().focus().setTextAlign('left').run();
        break;
      case 'alignCenter':
        this.editor.chain().focus().setTextAlign('center').run();
        break;
      case 'alignRight':
        this.editor.chain().focus().setTextAlign('right').run();
        break;
      case 'horizontalRule':
        this.editor.chain().focus().setHorizontalRule().run();
        break;
    }
  }

  isActive(format: string): boolean {
    if (!this.editor) return false;

    switch (format) {
      case 'bold':
        return this.editor.isActive('bold');
      case 'italic':
        return this.editor.isActive('italic');
      case 'underline':
        return this.editor.isActive('underline');
      case 'strikethrough':
        return this.editor.isActive('strike');
      case 'code':
        return this.editor.isActive('code');
      case 'codeBlock':
        return this.editor.isActive('codeBlock');
      case 'highlight':
        return this.editor.isActive('highlight');
      case 'h1':
        return this.editor.isActive('heading', { level: 1 });
      case 'h2':
        return this.editor.isActive('heading', { level: 2 });
      case 'h3':
        return this.editor.isActive('heading', { level: 3 });
      case 'bulletList':
        return this.editor.isActive('bulletList');
      case 'orderedList':
        return this.editor.isActive('orderedList');
      case 'taskList':
        return this.editor.isActive('taskList');
      case 'blockquote':
        return this.editor.isActive('blockquote');
      case 'alignLeft':
        return this.editor.isActive({ textAlign: 'left' });
      case 'alignCenter':
        return this.editor.isActive({ textAlign: 'center' });
      case 'alignRight':
        return this.editor.isActive({ textAlign: 'right' });
      default:
        return false;
    }
  }

  addLink(): void {
    const url = prompt('Enter URL:');
    if (url) {
      this.editor.chain().focus().setLink({ href: url }).run();
    }
  }

  removeLink(): void {
    this.editor.chain().focus().unsetLink().run();
  }

  addImage(): void {
    const url = prompt('Enter image URL:');
    if (url) {
      this.editor.chain().focus().setImage({ src: url }).run();
    }
  }

  async toggleFavorite(): Promise<void> {
    if (!this.currentPage) return;

    try {
      await this.booksService.toggleFavorite(
        this.currentPage.id, 
        this.currentPage.is_favorite
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  private calculateWordCount(html: string): number {
    const text = html.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/);
    return words.filter(word => word.length > 0).length;
  }
}
