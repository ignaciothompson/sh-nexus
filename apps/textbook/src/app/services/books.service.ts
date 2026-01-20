import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { Book, Page } from '../models/types';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private booksSubject = new BehaviorSubject<Book[]>([]);
  public books$ = this.booksSubject.asObservable();

  private currentBookSubject = new BehaviorSubject<Book | null>(null);
  public currentBook$ = this.currentBookSubject.asObservable();

  private currentPageSubject = new BehaviorSubject<Page | null>(null);
  public currentPage$ = this.currentPageSubject.asObservable();

  constructor(private pb: PocketbaseService) {
    // Don't auto-load books on initialization
    // Let components control when to load data
  }

  /**
   * Load all books with their pages
   */
  async loadBooks(): Promise<void> {
    try {
      const books = await this.pb.client.collection('books').getFullList<Book>({
        sort: '-created', // Sort by newest first, change to 'created' for oldest first
        // Note: Can't expand pages here since it's a reverse relation
        // Pages will be loaded separately per book
        requestKey: 'load_books' // Prevent auto-cancellation
      });
      this.booksSubject.next(books);
    } catch (error) {
      console.error('Error loading books:', error);
      this.booksSubject.next([]);
    }
  }

  /**
   * Create a new book
   */
  async createBook(data: { title: string; icon?: string; icon_color?: string; is_section?: boolean }): Promise<Book> {
    try {
      const book = await this.pb.client.collection('books').create<Book>({
        title: data.title,
        icon: data.is_section ? undefined : (data.icon || 'menu_book'),
        icon_color: data.is_section ? undefined : (data.icon_color || 'text-purple-400'),
        is_section: data.is_section || false
      });
      
      await this.loadBooks(); // Reload to get updated list
      return book;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  }

  /**
   * Update a book
   */
  async updateBook(id: string, data: Partial<Book>): Promise<Book> {
    try {
      const book = await this.pb.client.collection('books').update<Book>(id, data);
      await this.loadBooks();
      return book;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  }

  /**
   * Delete a book
   */
  async deleteBook(id: string): Promise<boolean> {
    try {
      await this.pb.client.collection('books').delete(id);
      await this.loadBooks();
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      return false;
    }
  }

  /**
   * Get pages for a specific book
   */
  async getBookPages(bookId: string): Promise<Page[]> {
    try {
      const pages = await this.pb.client.collection('pages').getFullList<Page>({
        filter: `book = "${bookId}"`,
        sort: '-created',
        // Add unique request key to prevent auto-cancellation
        requestKey: `pages_${bookId}`
      });
      return pages;
    } catch (error) {
      console.error('Error loading pages:', error);
      return [];
    }
  }

  /**
   * Get a single page
   */
  async getPage(pageId: string): Promise<Page | null> {
    try {
      const page = await this.pb.client.collection('pages').getOne<Page>(pageId);
      this.currentPageSubject.next(page);
      return page;
    } catch (error) {
      console.error('Error loading page:', error);
      return null;
    }
  }

  /**
   * Create a new page
   */
  async createPage(data: { 
    book: string; 
    title: string; 
    icon?: string; 
    content?: string;
    parent_page?: string;
  }): Promise<Page> {
    try {
      const page = await this.pb.client.collection('pages').create<Page>({
        book: data.book,
        title: data.title,
        icon: data.icon || 'description',
        content: data.content || '',
        is_favorite: false,
        parent_page: data.parent_page
      });
      
      await this.loadBooks(); // Reload to update expand data
      return page;
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }

  /**
   * Update a page
   */
  async updatePage(id: string, data: Partial<Page>): Promise<Page> {
    try {
      const page = await this.pb.client.collection('pages').update<Page>(id, data);
      this.currentPageSubject.next(page);
      return page;
    } catch (error) {
      console.error('Error updating page:', error);
      throw error;
    }
  }

  /**
   * Delete a page
   */
  async deletePage(id: string): Promise<boolean> {
    try {
      await this.pb.client.collection('pages').delete(id);
      await this.loadBooks();
      return true;
    } catch (error) {
      console.error('Error deleting page:', error);
      return false;
    }
  }

  /**
   * Set current book
   */
  setCurrentBook(book: Book | null): void {
    this.currentBookSubject.next(book);
  }

  /**
   * Set current page
   */
  setCurrentPage(page: Page | null): void {
    this.currentPageSubject.next(page);
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(pageId: string, currentStatus: boolean): Promise<void> {
    try {
      await this.updatePage(pageId, { is_favorite: !currentStatus });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }
}
