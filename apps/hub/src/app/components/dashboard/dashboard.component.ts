import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppsService } from '../../services/apps.service';
import { SectionsService } from '../../services/sections.service';
import { DialogService } from '../../services/dialog.service';
import { AppItem, Section } from '../../models/types';
import { AppTileComponent } from '../app-tile/app-tile.component';
import { EditAppModalComponent, EditAppDialogData, EditAppDialogResult } from '../modals/edit-app-modal/edit-app-modal.component';
import { SettingsModalComponent, SettingsDialogData, SettingsDialogResult } from '../modals/settings-modal/settings-modal.component';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppTileComponent, 
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  sections: Section[] = [];
  editMode = false;
  currentTime = new Date();
  
  isInitializing = true;

  hostStats: any = null;
  bookmarks: AppItem[] = [];

  // Pagination state - track current page per section
  sectionPages: Map<string, number> = new Map();
  readonly ITEMS_PER_PAGE = 6;

  // Reorder modal state
  showReorderModal = false;
  reorderTitle = '';
  reorderItems: AppItem[] = [];
  reorderSectionId: string | null = null; // null = bookmarks

  constructor(
    private appsService: AppsService,
    private sectionsService: SectionsService,
    private dialogService: DialogService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadSections();
    // NOTE: Host stats disabled - no backend server in unified container
    // this.loadStats();
    
    // Clock tick for time display
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  // Host stats disabled - no backend server in unified container architecture
  // To re-enable: create a stats endpoint or use PocketBase hooks
  loadStats() {
      // this.api.getHostStats().subscribe(stats => {
      //     this.hostStats = stats;
      //     if(stats.totalmem && stats.freemem) {
      //         this.hostStats.memPercent = Math.round(((stats.totalmem - stats.freemem) / stats.totalmem) * 100);
      //     }
      // });
  }

  loadSections() {
    this.appsService.getDashboardData().subscribe({
      next: (data) => {
        this.sections = data.sections;
        // Initialize pagination for each section
        data.sections.forEach(s => {
            if (s.id && !this.sectionPages.has(s.id)) {
                this.sectionPages.set(s.id, 0);
            }
        });
        this.isInitializing = false; // Assuming this is the intended property for isLoading
      },
      error: (err) => this.toastr.error('Failed to load sections')
    });
    this.loadBookmarks();
  }

  loadBookmarks() {
      this.appsService.getBookmarks().subscribe({
          next: (bookmarks) => this.bookmarks = bookmarks,
          error: (err) => console.error('Failed to load bookmarks', err)
      });
  }

  // --- PAGINATION ---
  getSectionPage(section: Section): number {
      return section.id ? (this.sectionPages.get(section.id) || 0) : 0;
  }

  getTotalPages(section: Section): number {
      const count = section.AppItems?.length || 0;
      return Math.ceil(count / this.ITEMS_PER_PAGE);
  }

  getPagedApps(section: Section): AppItem[] {
      const items = section.AppItems || [];
      const page = this.getSectionPage(section);
      const start = page * this.ITEMS_PER_PAGE;
      return items.slice(start, start + this.ITEMS_PER_PAGE);
  }

  nextPage(section: Section) {
      if (section.id) {
          const current = this.getSectionPage(section);
          if (current < this.getTotalPages(section) - 1) {
              this.sectionPages.set(section.id, current + 1);
          }
      }
  }

  prevPage(section: Section) {
      if (section.id) {
          const current = this.getSectionPage(section);
          if (current > 0) {
              this.sectionPages.set(section.id, current - 1);
          }
      }
  }

  showAddButton(section: Section): boolean {
      const items = section.AppItems || [];
      const page = this.getSectionPage(section);
      const totalPages = this.getTotalPages(section);
      // Show add button on last page if there's room (less than 6 items on current page)
      const isLastPage = page === totalPages - 1 || totalPages === 0;
      const itemsOnPage = this.getPagedApps(section).length;
      return isLastPage && itemsOnPage < this.ITEMS_PER_PAGE;
  }

  // --- HELPER METHODS ---
  getSectionIcon(section: Section): string {
      const title = section.title.toLowerCase();
      if (title.includes('media')) return 'smart_display';
      if (title.includes('system')) return 'dns';
      if (title.includes('auto')) return 'smart_toy';
      if (title.includes('network')) return 'router';
      if (title.includes('server')) return 'storage';
      return 'folder';
  }

  getSectionIconClass(section: Section): string {
      const title = section.title.toLowerCase();
      if (title.includes('media')) return 'text-purple';
      if (title.includes('system')) return 'text-blue';
      if (title.includes('auto')) return 'text-green';
      if (title.includes('network')) return 'text-orange';
      return 'text-primary';
  }

  getQuickIcon(item: AppItem): string {
      const name = item.name.toLowerCase();
      if (name.includes('terminal')) return 'terminal';
      if (name.includes('file')) return 'folder';
      if (name.includes('network')) return 'settings_ethernet';
      if (name.includes('reboot') || name.includes('restart')) return 'restart_alt';
      return 'link';
  }

  getQuickIconClass(item: AppItem): string {
      const name = item.name.toLowerCase();
      if (name.includes('terminal')) return 'quick-icon-blue';
      if (name.includes('file')) return 'quick-icon-green';
      if (name.includes('network')) return 'quick-icon-purple';
      if (name.includes('reboot') || name.includes('restart')) return 'quick-icon-orange';
      return 'quick-icon-blue';
  }

  openUrl(url: string) {
      window.open(url, '_blank');
  }

  // --- DIALOG ACTIONS ---
  openAddModal() {
    const editingItem: AppItem = { name: '', url: '' };
    // Default to first section
    if (this.sections.length > 0) {
        editingItem.section = this.sections[0].id;
    }
    this.openEditAppDialog(editingItem);
  }

  openAddModalForSection(section: Section) {
    const editingItem: AppItem = { name: '', url: '', section: section.id };
    this.openEditAppDialog(editingItem);
  }

  openAddBookmarkModal() {
    const editingItem: AppItem = { name: '', url: '', type: 'bookmark' };
    this.openEditAppDialog(editingItem);
  }

  openEditModal(item: AppItem) {
    this.openEditAppDialog({ ...item });
  }

  private openEditAppDialog(app: AppItem) {
    const dialogRef = this.dialogService.open<EditAppDialogResult, EditAppDialogData, EditAppModalComponent>(
      EditAppModalComponent,
      { 
        data: { app, sections: this.sections },
        size: 'lg' 
      }
    );
    dialogRef.closed.subscribe(result => {
      if (result?.action === 'save') {
        this.onSaveApp(result);
      } else if (result?.action === 'delete') {
        this.onDeleteApp(result.app);
      }
    });
  }

  onSaveApp(result: EditAppDialogResult) {
    const app = result.app;
    const file = result.file;

    if (app.id) {
      this.appsService.update(app.id, app, file).subscribe(() => {
        this.loadSections();
        this.loadBookmarks();
        this.toastr.success('Item updated');
      });
    } else {
      if (app.type === 'bookmark') {
          // Ensure bookmark doesn't have SectionId
          app.section = undefined;
          app.order = this.bookmarks.length;
          this.appsService.create(app, file).subscribe(() => {
            this.loadBookmarks();
            this.toastr.success('Bookmark added');
          });
      } else {
        if (!app.section && this.sections.length === 0) {
            // Create default section
            this.sectionsService.create({ title: 'Main', order: 0 }).subscribe((sec: Section) => {
                app.section = sec.id;
                app.order = 0;
                this.createApp(app, file);
            });
        } else {
            app.order = 999; // append
            this.createApp(app, file);
        }
      }
    }
  }

  createApp(app: AppItem, file?: File) {
      this.appsService.create(app, file).subscribe(() => {
        this.loadSections();
        this.toastr.success('Item added');
      });
  }

  onDeleteApp(app: AppItem) {
     if (app.id) {
       this.appsService.delete(app.id).subscribe(() => {
         this.loadSections();
         this.loadBookmarks();
         this.toastr.info('Item deleted');
       });
     }
  }

  trackById(index: number, item: any): string | number {
    return item.id || index;
  }

  // --- REORDER MODAL ---
  openReorderModal(section?: Section) {
    if (section) {
      this.reorderTitle = section.title;
      this.reorderItems = [...(section.AppItems || [])];
      this.reorderSectionId = section.id || null;
    } else {
      // Bookmarks / Quick Access
      this.reorderTitle = 'Quick Access';
      this.reorderItems = [...this.bookmarks];
      this.reorderSectionId = null;
    }
    this.showReorderModal = true;
  }

  moveItemUp(index: number) {
    if (index > 0) {
      const temp = this.reorderItems[index];
      this.reorderItems[index] = this.reorderItems[index - 1];
      this.reorderItems[index - 1] = temp;
    }
  }

  moveItemDown(index: number) {
    if (index < this.reorderItems.length - 1) {
      const temp = this.reorderItems[index];
      this.reorderItems[index] = this.reorderItems[index + 1];
      this.reorderItems[index + 1] = temp;
    }
  }

  saveReorder() {
    // Update order property for each item
    this.reorderItems.forEach((item, idx) => {
      item.order = idx;
      if (item.id) {
        this.appsService.update(item.id, item).subscribe();
      }
    });

    // Refresh data
    if (this.reorderSectionId === null) {
      this.loadBookmarks();
    } else {
      this.loadSections();
    }

    this.showReorderModal = false;
    this.toastr.success('Order updated');
  }

  closeReorderModal() {
    this.showReorderModal = false;
  }
}
