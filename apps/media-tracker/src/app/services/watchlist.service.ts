import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { WatchlistItem, MediaItem } from '../models/types';

/**
 * Watchlist Service
 * Manages user's watchlist (items to watch later)
 */
@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private collection = 'watchlist';

  constructor(private pbService: PocketbaseService) {}

  /**
   * Get all watchlist items
   */
  async getAll(): Promise<WatchlistItem[]> {
    return await this.pbService.client
      .collection(this.collection)
      .getFullList<WatchlistItem>({ sort: '-created' });
  }

  /**
   * Add item to watchlist
   */
  async add(item: MediaItem, type: 'movie' | 'tv'): Promise<WatchlistItem> {
    return await this.pbService.client.collection(this.collection).create<WatchlistItem>({
      media_id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      media_type: type,
    });
  }

  /**
   * Remove item from watchlist
   */
  async remove(id: string): Promise<void> {
    await this.pbService.client.collection(this.collection).delete(id);
  }

  /**
   * Check if item is in watchlist
   */
  async isInWatchlist(mediaId: number, type: 'movie' | 'tv'): Promise<WatchlistItem | null> {
    try {
      const result = await this.pbService.client
        .collection(this.collection)
        .getFirstListItem<WatchlistItem>(`media_id=${mediaId} && media_type="${type}"`);
      return result;
    } catch {
      return null;
    }
  }
}
