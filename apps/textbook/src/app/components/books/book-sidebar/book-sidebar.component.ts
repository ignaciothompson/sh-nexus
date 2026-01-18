import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddBookModalComponent, NewBookData } from '../add-book-modal/add-book-modal.component';
import { AddPageModalComponent, NewPageData } from '../add-page-modal/add-page-modal.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { BooksService } from '../../../services/books.service';
import { Book, Page } from '../../../models/types';
import { Subscription } from 'rxjs';

interface BookWithPages extends Book {
  expanded: boolean;
  pages: Page[];
  pageCount?: number;
  pagesLoaded?: boolean; // Track if pages have been loaded
}

@Component({
  selector: 'app-book-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, AddBookModalComponent, AddPageModalComponent, ConfirmDialogComponent],
  templateUrl: './book-sidebar.component.html',
  styleUrls: ['./book-sidebar.component.css']
})
export class BookSidebarComponent implements OnInit, OnDestroy {
  searchQuery = '';
  showAddModal = false;
  showAddPageModal = false;
  showAddMenu = false;
  modalMode: 'create' | 'edit' = 'create';
  editingBook: BookWithPages | null = null;
  books: BookWithPages[] = [];
  selectedPageId = '';
  activeDropdownId: string | null = null;
  showDeleteConfirm = false;
  showDeletePageConfirm = false;
  bookToDelete: BookWithPages | null = null;
  pageToDelete: { page: Page; book: BookWithPages } | null = null;
  
  private subscription = new Subscription();

  constructor(private booksService: BooksService) {}

  get selectedBookIdForPage(): string | undefined {
    return this.books.find(b => b.expanded)?.id;
  }

  ngOnInit(): void {
    // Subscribe to books from service
    this.subscription.add(
      this.booksService.books$.subscribe((books) => {
        // Preserve expanded/loaded state when books reload
        const previousState = new Map(
          this.books.map(b => [b.id, { 
            expanded: b.expanded, 
            pages: b.pages, 
            pagesLoaded: b.pagesLoaded 
          }])
        );

        this.books = books.map(book => {
          const prevState = previousState.get(book.id);
          return {
            ...book,
            expanded: prevState?.expanded || false,
            pages: prevState?.pages || [],
            pageCount: prevState?.pages?.length || 0,
            pagesLoaded: prevState?.pagesLoaded || false
          } as BookWithPages;
        });
      })
    );

    // Subscribe to current page
    this.subscription.add(
      this.booksService.currentPage$.subscribe((page) => {
        if (page) {
          this.selectedPageId = page.id;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get filteredBooks(): BookWithPages[] {
    if (!this.searchQuery.trim()) {
      return this.books;
    }
    const query = this.searchQuery.toLowerCase();
    return this.books.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.pages.some(page => page.title.toLowerCase().includes(query))
    );
  }

  async toggleBook(book: BookWithPages): Promise<void> {
    // Don't toggle if it's a section
    if (book.is_section) {
      return;
    }
    
    book.expanded = !book.expanded;
    
    // Lazy load pages when expanding for the first time
    if (book.expanded && !book.pagesLoaded) {
      try {
        const pages = await this.booksService.getBookPages(book.id);
        book.pages = pages;
        book.pageCount = pages.length;
        book.pagesLoaded = true;
      } catch (error) {
        console.error(`Error loading pages for book ${book.id}:`, error);
      }
    }
  }

  async selectPage(page: Page): Promise<void> {
    this.selectedPageId = page.id;
    await this.booksService.getPage(page.id);
  }

  openAddBookModal(): void {
    this.modalMode = 'create';
    this.editingBook = null;
    this.showAddModal = true;
  }

  closeAddBookModal(): void {
    this.showAddModal = false;
    this.editingBook = null;
  }

  async onSaveBook(bookData: NewBookData): Promise<void> {
    try {
      if (this.modalMode === 'edit' && this.editingBook) {
        // Update existing book
        console.log('Updating book:', this.editingBook.id, bookData);
        await this.booksService.updateBook(this.editingBook.id, {
          title: bookData.title,
          icon: bookData.icon,
          icon_color: bookData.iconColor
        });
      } else {
        // Create new book
        console.log('Creating new book:', bookData);
        await this.booksService.createBook({
          title: bookData.title,
          icon: bookData.icon,
          icon_color: bookData.iconColor
        });
      }
      // Close modal and reset state
      this.showAddModal = false;
      this.editingBook = null;
      this.modalMode = 'create';
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Failed to save book. Please try again.');
    }
  }

  async deleteBook(book: BookWithPages, event: Event): Promise<void> {
    event.stopPropagation();
    this.activeDropdownId = null;
    this.bookToDelete = book;
    this.showDeleteConfirm = true;
  }

  async confirmDelete(): Promise<void> {
    if (!this.bookToDelete) return;
    
    try {
      await this.booksService.deleteBook(this.bookToDelete.id);
      this.showDeleteConfirm = false;
      this.bookToDelete = null;
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book. Please try again.');
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.bookToDelete = null;
  }

  editBook(book: BookWithPages, event: Event): void {
    event.stopPropagation();
    this.activeDropdownId = null;
    this.modalMode = 'edit';
    this.editingBook = book;
    this.showAddModal = true;
  }

  toggleDropdown(book: BookWithPages, event: Event): void {
    event.stopPropagation(); // Prevent book toggle
    this.activeDropdownId = this.activeDropdownId === book.id ? null : book.id;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Close dropdown when clicking outside
    this.activeDropdownId = null;
    this.showAddMenu = false;
  }

  toggleAddMenu(event: Event): void {
    event.stopPropagation();
    this.showAddMenu = !this.showAddMenu;
  }

  openAddPageModal(): void {
    this.showAddMenu = false;
    this.showAddPageModal = true;
  }

  closeAddPageModal(): void {
    this.showAddPageModal = false;
  }

  addSection(): void {
    this.showAddMenu = false;
    const sectionTitle = prompt('Enter section name:');
    if (sectionTitle && sectionTitle.trim()) {
      this.booksService.createBook({
        title: sectionTitle.trim(),
        is_section: true
      }).then(() => {
        console.log('Section created');
        // Books will auto-reload via subscription
      }).catch((err: any) => {
        console.error('Error creating section:', err);
      });
    }
  }

  editSection(section: BookWithPages, event: Event): void {
    event.stopPropagation();
    this.activeDropdownId = null;
    
    const newTitle = prompt('Enter new section name:', section.title);
    if (newTitle && newTitle.trim() && newTitle !== section.title) {
      this.booksService.updateBook(section.id, { title: newTitle.trim() }).then(() => {
        console.log('Section updated');
        // Books will auto-reload via subscription
      }).catch((err: any) => {
        console.error('Error updating section:', err);
      });
    }
  }

  deleteSection(section: BookWithPages, event: Event): void {
    event.stopPropagation();
    this.activeDropdownId = null;
    this.bookToDelete = section;
    this.showDeleteConfirm = true;
  }

  onSavePage(pageData: NewPageData): void {
    this.booksService.createPage({
      book: pageData.bookId,
      title: pageData.title,
      icon: pageData.icon,
      content: ''
    }).then((newPage: Page) => {
      console.log('Page created:', newPage);
      // Reload the book's pages
      const book = this.books.find(b => b.id === pageData.bookId);
      if (book) {
        // Force reload by resetting the flag
        book.pagesLoaded = false;
        this.loadBookPages(book);
      }
      this.closeAddPageModal();
    }).catch((err: any) => {
      console.error('Error creating page:', err);
    });
  }

  private async loadBookPages(book: BookWithPages): Promise<void> {
    if (!book.pagesLoaded) {
      try {
        const pages = await this.booksService.getBookPages(book.id);
        book.pages = pages;
        book.pageCount = pages.length;
        book.pagesLoaded = true;
      } catch (err: any) {
        console.error('Error loading pages:', err);
      }
    }
  }

  // Delete page methods
  deletePage(page: Page, book: BookWithPages, event: Event): void {
    event.stopPropagation();
    this.pageToDelete = { page, book };
    this.showDeletePageConfirm = true;
  }

  confirmDeletePage(): void {
    if (this.pageToDelete) {
      this.booksService.deletePage(this.pageToDelete.page.id).then(() => {
        console.log('Page deleted');
        // Refresh the book's pages
        if (this.pageToDelete) {
          this.pageToDelete.book.pagesLoaded = false;
          this.loadBookPages(this.pageToDelete.book);
        }
        this.cancelDeletePage();
      }).catch((err: any) => {
        console.error('Error deleting page:', err);
      });
    }
  }

  cancelDeletePage(): void {
    this.showDeletePageConfirm = false;
    this.pageToDelete = null;
  }
}
