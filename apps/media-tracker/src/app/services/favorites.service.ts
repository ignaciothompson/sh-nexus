import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { FavoriteItem, MediaItem } from '../models/types';

/**
 * Favorites Service
 * Manages user's favorite movies and TV shows
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private collection = 'favorites';

  constructor(private pbService: PocketbaseService) {}

  /**
   * Get all favorite items
   */
  async getAll(): Promise<FavoriteItem[]> {
    return await this.pbService.client
      .collection(this.collection)
      .getFullList<FavoriteItem>({ sort: '-created' });
  }

  /**
   * Toggle favorite status (add/remove)
   */
  async toggle(item: MediaItem, type: 'movie' | 'tv'): Promise<{ added: boolean; item?: FavoriteItem }> {
    const existing = await this.isFavorite(item.id, type);

    if (existing) {
      await this.pbService.client.collection(this.collection).delete(existing.id);
      return { added: false };
    } else {
      const created = await this.pbService.client.collection(this.collection).create<FavoriteItem>({
        media_id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        media_type: type,
      });
      return { added: true, item: created };
    }
  }

  /**
   * Check if item is a favorite
   */
  async isFavorite(mediaId: number, type: 'movie' | 'tv'): Promise<FavoriteItem | null> {
    try {
      const result = await this.pbService.client
        .collection(this.collection)
        .getFirstListItem<FavoriteItem>(`media_id=${mediaId} && media_type="${type}"`);
      return result;
    } catch {
      return null;
    }
  }
}
