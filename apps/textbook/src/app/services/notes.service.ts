import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { Note } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private collectionName = 'notes';

  constructor(private pbService: PocketbaseService) {}

  async getLabels(): Promise<any[]> {
    return await this.pbService.client
      .collection('notes_label')
      .getFullList({ sort: 'name', requestKey: null });
  }

  async create(note: Partial<Note> | FormData): Promise<Note> {
    return await this.pbService.client
      .collection(this.collectionName)
      .create<Note>(note, { requestKey: null, expand: 'label' });
  }

  async update(id: string, note: Partial<Note> | FormData): Promise<Note> {
    return await this.pbService.client
      .collection(this.collectionName)
      .update<Note>(id, note, { requestKey: null, expand: 'label' });
  }

  async delete(id: string): Promise<boolean> {
    await this.pbService.client
      .collection(this.collectionName)
      .delete(id, { requestKey: null });
    return true;
  }

  async toggleFavorite(id: string, is_favorite: boolean): Promise<Note> {
    return await this.pbService.client
      .collection(this.collectionName)
      .update<Note>(id, { is_favorite }, { requestKey: null, expand: 'label' });
  }

  // Update getAll to expand labels
  async getAll(): Promise<Note[]> {
    const records = await this.pbService.client
      .collection(this.collectionName)
      .getFullList<Note>({ 
        sort: '-updated',
        requestKey: null,
        expand: 'label'
      });
    return records;
  }
}
