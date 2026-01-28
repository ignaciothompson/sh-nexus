import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { SeenHistoryItem, Movie, TVShow } from '../models/types';

/**
 * History Service
 * Manages user's viewing history (seen movies/shows)
 */
@Injectable({ providedIn: 'root' })
export class HistoryService {
  private collection = 'seen_history';

  constructor(private pbService: PocketbaseService) {}

  /**
   * Get all seen history items
   */
  async getAll(): Promise<SeenHistoryItem[]> {
    return await this.pbService.client
      .collection(this.collection)
      .getFullList<SeenHistoryItem>({ sort: '-watched_at' });
  }

  /**
   * Mark a movie/show as seen
   */
  async markAsSeen(item: Movie | TVShow, type: 'movie' | 'tv'): Promise<SeenHistoryItem> {
    // Get runtime based on type
    let runtime = 0;
    if (type === 'movie' && 'runtime' in item) {
      runtime = item.runtime || 0;
    } else if (type === 'tv' && 'episode_run_time' in item) {
      runtime = item.episode_run_time?.[0] || 0;
    }

    return await this.pbService.client.collection(this.collection).create<SeenHistoryItem>({
      media_id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      media_type: type,
      runtime: runtime,
      genres: item.genres?.map((g) => g.name) || [],
      watched_at: new Date().toISOString(),
    });
  }

  /**
   * Get total watch time in minutes
   */
  async getTotalWatchTime(): Promise<number> {
    const history = await this.getAll();
    return history.reduce((total, item) => total + (item.runtime || 0), 0);
  }

  /**
   * Get genre statistics
   */
  async getGenreStats(): Promise<Map<string, number>> {
    const history = await this.getAll();
    const stats = new Map<string, number>();
    
    history.forEach((item) => {
      item.genres?.forEach((genre) => {
        stats.set(genre, (stats.get(genre) || 0) + 1);
      });
    });
    
    return stats;
  }

  /**
   * Get combined stats for the stats page
   */
  getStats() {
    return new Promise<{
      totalWatched: number;
      hoursWatched: number;
      moviesWatched: number;
      seriesCompleted: number;
      avgRating: number;
      topGenre: string;
    }>(async (resolve) => {
      const history = await this.getAll();
      const totalWatchTime = history.reduce((total, item) => total + (item.runtime || 0), 0);
      const genreStats = await this.getGenreStats();
      
      let topGenre = 'N/A';
      let maxCount = 0;
      genreStats.forEach((count, genre) => {
        if (count > maxCount) {
          maxCount = count;
          topGenre = genre;
        }
      });

      const movies = history.filter(h => h.media_type === 'movie');
      const series = history.filter(h => h.media_type === 'tv');

      resolve({
        totalWatched: history.length,
        hoursWatched: Math.round(totalWatchTime / 60),
        moviesWatched: movies.length,
        seriesCompleted: series.length,
        avgRating: 7.8, // Mock value since we don't store ratings
        topGenre
      });
    });
  }
}
