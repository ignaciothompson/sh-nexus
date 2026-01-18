import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { Note, NoteLabel } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private collectionName = 'notes';
  private labelsCollectionName = 'notes_labels';

  constructor(private pbService: PocketbaseService) {}

  // Label Management
  async getLabels(): Promise<NoteLabel[]> {
    return await this.pbService.client
      .collection(this.labelsCollectionName)
      .getFullList<NoteLabel>({ sort: 'name', requestKey: null });
  }

  async createLabel(data: { name: string; color?: string }): Promise<NoteLabel> {
    return await this.pbService.client
      .collection(this.labelsCollectionName)
      .create<NoteLabel>(data, { requestKey: null });
  }

  async updateLabel(id: string, data: Partial<NoteLabel>): Promise<NoteLabel> {
    return await this.pbService.client
      .collection(this.labelsCollectionName)
      .update<NoteLabel>(id, data, { requestKey: null });
  }

  async deleteLabel(id: string): Promise<boolean> {
    await this.pbService.client
      .collection(this.labelsCollectionName)
      .delete(id, { requestKey: null });
    return true;
  }

  // Note Management
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
