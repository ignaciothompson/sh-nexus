import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { Note } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private collectionName = 'notes';

  constructor(private pbService: PocketbaseService) {}

  async getAll(): Promise<Note[]> {
    const records = await this.pbService.client
      .collection(this.collectionName)
      .getFullList<Note>({ 
        sort: '-updated',
        requestKey: null // Disable auto-cancellation
      });
    return records;
  }

  async getById(id: string): Promise<Note> {
    return await this.pbService.client
      .collection(this.collectionName)
      .getOne<Note>(id, { requestKey: null });
  }

  async create(note: Partial<Note>): Promise<Note> {
    return await this.pbService.client
      .collection(this.collectionName)
      .create<Note>(note, { requestKey: null });
  }

  async update(id: string, note: Partial<Note>): Promise<Note> {
    return await this.pbService.client
      .collection(this.collectionName)
      .update<Note>(id, note, { requestKey: null });
  }

  async delete(id: string): Promise<boolean> {
    await this.pbService.client
      .collection(this.collectionName)
      .delete(id, { requestKey: null });
    return true;
  }

  async toggleMark(id: string, isMarked: boolean): Promise<Note> {
    return await this.pbService.client
      .collection(this.collectionName)
      .update<Note>(id, { isMarked }, { requestKey: null });
  }
}
