import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ListsService } from '../../../services/lists.service';
import { UserList } from '../../../models/types';
import { ToastrService } from 'ngx-toastr';

export interface ListSelectorModalData {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
}

@Component({
  selector: 'app-list-selector-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-selector-modal.component.html',
  styleUrl: './list-selector-modal.component.css'
})
export class ListSelectorModalComponent implements OnInit {
  private dialogRef = inject(DialogRef);
  private data = inject<ListSelectorModalData>(DIALOG_DATA);
  private listsService = inject(ListsService);
  private toastr = inject(ToastrService);

  lists: UserList[] = [];
  listsContainingMedia: Set<string> = new Set();
  loading = true;
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadLists();
  }

  private async loadLists() {
    this.loading = true;
    
    // Timeout promise
    const timeoutMs = 3000;
    const timeoutPromise = new Promise<void>((_, reject) => 
      setTimeout(() => reject(new Error('Data loading timed out')), timeoutMs)
    );

    const loadDataPromise = async () => {
      this.lists = await this.listsService.getAll();
      const containing = await this.listsService.getListsContaining(
        this.data.tmdbId, 
        this.data.mediaType
      );
      this.listsContainingMedia = new Set(containing.map(l => l.id));
    };

    try {
      await Promise.race([loadDataPromise(), timeoutPromise]);
    } catch (err) {
      if ((err as Error).message === 'Data loading timed out') {
         this.toastr.warning('Lists took too long to load');
      } else {
         this.toastr.error('Failed to load lists');
      }
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  isInList(listId: string): boolean {
    return this.listsContainingMedia.has(listId);
  }

  async toggleList(list: UserList) {
    const isIn = this.isInList(list.id);
    
    try {
      if (isIn) {
        await this.listsService.removeFromList(list.id, this.data.tmdbId, this.data.mediaType);
        this.listsContainingMedia.delete(list.id);
        this.toastr.success(`Removed from "${list.name}"`);
      } else {
        await this.listsService.addToList(list.id, {
          tmdb_id: this.data.tmdbId,
          media_type: this.data.mediaType,
          title: this.data.title,
          poster_path: this.data.posterPath,
          notes: null,
        });
        this.listsContainingMedia.add(list.id);
        this.toastr.success(`Added to "${list.name}"`);
      }
    } catch {
      this.toastr.error('Failed to update list');
    }
  }

  async createNewList() {
    const name = prompt('Enter list name:');
    if (!name) return;
    
    try {
      const newList = await this.listsService.create(name);
      this.lists.push(newList);
      await this.toggleList(newList);
    } catch {
      this.toastr.error('Failed to create list');
    }
  }

  close() {
    this.dialogRef.close();
  }
}
