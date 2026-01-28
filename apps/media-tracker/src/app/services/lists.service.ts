import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { UserList, ListItem } from '../models/types';

/**
 * Lists Service
 * Manages user's custom lists
 */
@Injectable({ providedIn: 'root' })
export class ListsService {
  private collection = 'lists';

  constructor(private pb: PocketbaseService) {}

  /**
   * Get all user lists
   */
  async getAll(): Promise<UserList[]> {
    return await this.pb.client
      .collection(this.collection)
      .getFullList<UserList>({ sort: 'sort_order' });
  }

  /**
   * Get a single list by ID
   */
  async getById(id: string): Promise<UserList> {
    return await this.pb.client.collection(this.collection).getOne<UserList>(id);
  }

  /**
   * Create a new list
   */
  async create(name: string, options?: { description?: string; color?: string; icon?: string }): Promise<UserList> {
    const lists = await this.getAll();
    return await this.pb.client.collection(this.collection).create<UserList>({
      name,
      description: options?.description || null,
      color: options?.color || null,
      icon: options?.icon || null,
      is_public: false,
      sort_order: lists.length,
      items: [],
    });
  }

  /**
   * Update a list
   */
  async update(id: string, data: Partial<Pick<UserList, 'name' | 'description' | 'color' | 'icon' | 'is_public'>>): Promise<UserList> {
    return await this.pb.client.collection(this.collection).update<UserList>(id, data);
  }

  /**
   * Delete a list
   */
  async delete(id: string): Promise<void> {
    await this.pb.client.collection(this.collection).delete(id);
  }

  /**
   * Add media item to a list
   */
  async addToList(listId: string, item: Omit<ListItem, 'position' | 'added_at'>): Promise<UserList> {
    const list = await this.getById(listId);
    const items = list.items || [];
    
    // Check if already in list
    if (items.some(i => i.tmdb_id === item.tmdb_id && i.media_type === item.media_type)) {
      return list; // Already exists
    }

    const newItem: ListItem = {
      ...item,
      position: items.length,
      added_at: new Date().toISOString(),
    };

    return await this.pb.client.collection(this.collection).update<UserList>(listId, {
      items: [...items, newItem],
    });
  }

  /**
   * Remove media item from a list
   */
  async removeFromList(listId: string, tmdbId: number, mediaType: 'movie' | 'tv'): Promise<UserList> {
    const list = await this.getById(listId);
    const items = (list.items || []).filter(
      i => !(i.tmdb_id === tmdbId && i.media_type === mediaType)
    );

    return await this.pb.client.collection(this.collection).update<UserList>(listId, {
      items,
    });
  }

  /**
   * Check if media is in any lists
   */
  async getListsContaining(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<UserList[]> {
    const allLists = await this.getAll();
    return allLists.filter(list => 
      list.items?.some(i => i.tmdb_id === tmdbId && i.media_type === mediaType)
    );
  }
}
