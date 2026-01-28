import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { TrackedMovie, MediaStatus, Movie, TVShow } from '../models/types';

/**
 * Movie Tracker Service
 * Manages tracked movies in PocketBase
 */
@Injectable({ providedIn: 'root' })
export class MovieTrackerService {
  private getCollection(type: 'movie' | 'tv'): string {
    return type === 'tv' ? 'tv_shows' : 'movies';
  }

  constructor(private pb: PocketbaseService) {}

  /**
   * Get all tracked items
   */
  async getAll(type: 'movie' | 'tv' | 'all' = 'movie'): Promise<TrackedMovie[]> {
    if (type === 'all') {
      const [movies, shows] = await Promise.all([
        this.getAll('movie'),
        this.getAll('tv')
      ]);
      return [
        ...movies,
        ...shows
      ].sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
    }

    const items = await this.pb.client
      .collection(this.getCollection(type as 'movie' | 'tv'))
      .getFullList<TrackedMovie>({ sort: '-updated' });
      
    return items.map(item => ({ ...item, media_type: type as 'movie' | 'tv' }));
  }

  /**
   * Get items by status filter
   */
  async getByStatus(filter: 'favourite' | 'watchlist' | 'watched', type: 'movie' | 'tv' | 'all' = 'movie'): Promise<TrackedMovie[]> {
    const all = await this.getAll(type);
    return all.filter(m => m.status?.[filter] === true);
  }

  /**
   * Get a tracked item by TMDB ID
   */
  async getByTmdbId(tmdbId: number, type: 'movie' | 'tv' = 'movie'): Promise<TrackedMovie | null> {
    try {
      return await this.pb.client
        .collection(this.getCollection(type))
        .getFirstListItem<TrackedMovie>(`tmdb_id=${tmdbId}`, { $autoCancel: false });
    } catch {
      return null;
    }
  }

  /**
   * Track a new item (create from TMDB data)
   */
  async track(media: Movie | TVShow, type: 'movie' | 'tv', initialStatus?: Partial<MediaStatus>): Promise<TrackedMovie> {
    const status: MediaStatus = {
      favourite: initialStatus?.favourite ?? false,
      watchlist: initialStatus?.watchlist ?? false,
      watched: initialStatus?.watched ?? false,
    };

    const title = type === 'movie' ? (media as Movie).title : (media as TVShow).name;
    const releaseDate = type === 'movie' ? (media as Movie).release_date : (media as TVShow).first_air_date;

    return await this.pb.client.collection(this.getCollection(type)).create<TrackedMovie>({
      tmdb_id: media.id,
      title: title,
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      overview: media.overview,
      tagline: (media as Movie).tagline || null,
      runtime: (media as Movie).runtime || (media as unknown as any).episode_run_time?.[0] || 0,
      release_date: releaseDate || null,
      vote_average: media.vote_average || 0,
      genres: media.genres?.map(g => g.name) || [],
      status,
      personal_rating: null,
      watch_count: 0,
      last_watch_date: null,
    });
  }

  /**
   * Update item status (favourite, watchlist, watched)
   */
  async updateStatus(id: string, status: Partial<MediaStatus>, type: 'movie' | 'tv' = 'movie'): Promise<TrackedMovie> {
    const collection = this.getCollection(type);
    const movie = await this.pb.client.collection(collection).getOne<TrackedMovie>(id);
    const newStatus = { ...movie.status, ...status };
    return await this.pb.client.collection(collection).update<TrackedMovie>(id, {
      status: newStatus,
    });
  }

  /**
   * Toggle a status flag
   */
  async toggleStatus(tmdbId: number, flag: keyof MediaStatus, media: Movie | TVShow, type: 'movie' | 'tv' = 'movie'): Promise<TrackedMovie> {
    let tracked = await this.getByTmdbId(tmdbId, type);
    
    if (!tracked && media) {
      // Create new tracked item with this flag set
      tracked = await this.track(media, type, { [flag]: true });
      return tracked;
    }
    
    if (!tracked) {
      throw new Error('Media not tracked and no data provided');
    }

    const newValue = !tracked.status[flag];
    return await this.updateStatus(tracked.id, { [flag]: newValue }, type);
  }

  /**
   * Mark item as watched
   */
  async markWatched(tmdbId: number, media: Movie | TVShow, type: 'movie' | 'tv' = 'movie'): Promise<TrackedMovie> {
    let tracked = await this.getByTmdbId(tmdbId, type);
    
    if (!tracked && media) {
      tracked = await this.track(media, type, { watched: true });
    }
    
    if (!tracked) {
      throw new Error('Media not tracked and no data provided');
    }

    return await this.pb.client.collection(this.getCollection(type)).update<TrackedMovie>(tracked.id, {
      status: { ...tracked.status, watched: true },
      watch_count: (tracked.watch_count || 0) + 1,
      last_watch_date: new Date().toISOString(),
    });
  }

  /**
   * Set personal rating
   */
  async setRating(id: string, rating: number, type: 'movie' | 'tv' = 'movie'): Promise<TrackedMovie> {
    return await this.pb.client.collection(this.getCollection(type)).update<TrackedMovie>(id, {
      personal_rating: rating,
    });
  }

  /**
   * Toggle episode watched status
   */
  async toggleEpisode(tmdbId: number, season: number, episode: number): Promise<TrackedMovie> {
    const tracked = await this.getByTmdbId(tmdbId, 'tv');
    if (!tracked) {
      throw new Error('TV Show must be tracked first');
    }

    const currentEpisodes = Array.isArray(tracked.watched_episodes) ? tracked.watched_episodes : [];
    const epId = `S${season}E${episode}`;
    
    let newEpisodes: string[];
    if (currentEpisodes.includes(epId)) {
      newEpisodes = currentEpisodes.filter(e => e !== epId);
    } else {
      newEpisodes = [...currentEpisodes, epId];
    }
    
    return await this.pb.client.collection('tv_shows').update<TrackedMovie>(tracked.id, {
      watched_episodes: newEpisodes
    });
  }
}
