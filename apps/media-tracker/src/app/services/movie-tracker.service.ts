import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { TrackedMovie, MediaStatus, Movie, TVShow, WatchlistRecord, MediaItem, CurrentlyWatchingRecord } from '../models/types';

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
  async toggleEpisode(tmdbId: number, season: number, episode: number, totalEpisodes?: number, media?: MediaItem): Promise<TrackedMovie> {
    console.log('toggleEpisode called:', { tmdbId, season, episode, totalEpisodes });
    
    let tracked = await this.getByTmdbId(tmdbId, 'tv');
    if (!tracked) {
      throw new Error('TV Show must be tracked first');
    }

    let currentEpisodes = Array.isArray(tracked.watched_episodes) ? tracked.watched_episodes : [];
    
    // Sync from currently_watching if watched_episodes is empty but we have progress
    if (currentEpisodes.length === 0) {
      try {
        const cwRecord = await this.pb.client.collection('currently_watching').getFirstListItem(`tmdb_id=${tmdbId}`);
        if (cwRecord && cwRecord['last_season'] && cwRecord['last_episode']) {
          console.log('Syncing watched_episodes from currently_watching:', cwRecord['last_season'], cwRecord['last_episode']);
          // Populate all episodes up to last_episode
          for (let ep = 1; ep <= cwRecord['last_episode']; ep++) {
            currentEpisodes.push(`S${cwRecord['last_season']}E${ep}`);
          }
          console.log('Synced watched_episodes:', currentEpisodes);
        }
      } catch {
        // No currently_watching record, that's fine
      }
    }
    
    const epId = `S${season}E${episode}`;
    
    console.log('Current watched episodes:', currentEpisodes);
    console.log('Toggling episode:', epId);
    
    let newEpisodes: string[];
    if (currentEpisodes.includes(epId)) {
      newEpisodes = currentEpisodes.filter(e => e !== epId);
      console.log('Episode was watched, removing it');
    } else {
      newEpisodes = [...currentEpisodes, epId];
      console.log('Episode was not watched, adding it');
    }
    
    console.log('New watched episodes:', newEpisodes);
    
    const result = await this.pb.client.collection('tv_shows').update<TrackedMovie>(tracked.id, {
      watched_episodes: newEpisodes
    });

    if (totalEpisodes && media) {
        // Find the most recent episode from the watched list
        const latestEp = this.getLatestEpisode(newEpisodes);
        console.log('Latest episode from list:', latestEp);
        console.log('Updating currently_watching with count:', newEpisodes.length);
        
        await this.updateCurrentlyWatching(
          tmdbId, 
          media, 
          newEpisodes.length, 
          totalEpisodes,
          undefined, // platform (optional)
          latestEp.season,
          latestEp.episode
        );
    }

    return result;
  }

  /**
   * Helper to parse the latest episode from watched_episodes array
   */
  private getLatestEpisode(episodes: string[]): { season: number, episode: number } {
    if (!episodes || episodes.length === 0) {
      return { season: 1, episode: 0 };
    }

    // Parse all episodes and find the highest season and episode
    const parsed = episodes.map(ep => {
      const match = ep.match(/S(\d+)E(\d+)/);
      return match ? { season: parseInt(match[1]), episode: parseInt(match[2]) } : null;
    }).filter(Boolean) as { season: number, episode: number }[];

    // Sort by season desc, then episode desc
    parsed.sort((a, b) => {
      if (a.season !== b.season) return b.season - a.season;
      return b.episode - a.episode;
    });

    return parsed[0] || { season: 1, episode: 0 };
  }

  /**
   * Update Currently Watching collection
   */
  async updateCurrentlyWatching(
    tmdbId: number, 
    media: MediaItem, 
    episodesWatched: number, 
    totalEpisodes: number, 
    platform?: number,
    lastSeason?: number,
    lastEpisode?: number
  ) {
     console.log('updateCurrentlyWatching called:', { 
       tmdbId, 
       episodesWatched, 
       totalEpisodes, 
       platform, 
       lastSeason, 
       lastEpisode 
     });
     
     if (episodesWatched === 0 || episodesWatched >= totalEpisodes) {
        console.log('Removing from currently_watching (episodes:', episodesWatched, ')');
        // Remove if exists
        try {
            const existing = await this.pb.client.collection('currently_watching').getFirstListItem(`tmdb_id=${tmdbId}`);
            await this.pb.client.collection('currently_watching').delete(existing.id);
            console.log('Removed from currently_watching');
        } catch {}
        return;
     }
     
     // Update or Create
     try {
        const existing = await this.pb.client.collection('currently_watching').getFirstListItem(`tmdb_id=${tmdbId}`);
        console.log('Found existing record, updating:', existing.id);
        
        const updateData = {
            episodes_watched: episodesWatched,
            total_episodes: totalEpisodes,
            ...(platform && { platform }),
            ...(lastSeason && { last_season: lastSeason }),
            ...(lastEpisode !== undefined && { last_episode: lastEpisode })
        };
        console.log('Update data:', updateData);
        
        await this.pb.client.collection('currently_watching').update(existing.id, updateData);
        console.log('Updated successfully');
     } catch {
        console.log('No existing record, creating new one');
        // Create
        const createData = {
            tmdb_id: tmdbId,
            media_type: 'tv',
            title: media.title || (media as any).name || 'Unknown',
            poster_path: media.poster_path,
            total_episodes: totalEpisodes,
            episodes_watched: episodesWatched,
            ...(platform && { platform }),
            ...(lastSeason && { last_season: lastSeason }),
            ...(lastEpisode !== undefined && { last_episode: lastEpisode })
        };
        console.log('Create data:', createData);
        
        await this.pb.client.collection('currently_watching').create(createData);
        console.log('Created successfully');
     }
  }

  /**
   * Get all currently watching items
   */
  async getCurrentlyWatching(): Promise<CurrentlyWatchingRecord[]> {
    return await this.pb.client.collection('currently_watching').getFullList<CurrentlyWatchingRecord>({ sort: '-updated' });
  }

  /**
   * Get all watchlist items (lightweight)
   */
  async getWatchlist(): Promise<WatchlistRecord[]> {
    return await this.pb.client.collection('watchlist').getFullList<WatchlistRecord>({ sort: '-created' });
  }

  /**
   * Check if item is in watchlist
   */
  async isInWatchlist(tmdbId: number, type: 'movie' | 'tv'): Promise<boolean> {
    try {
      await this.pb.client.collection('watchlist').getFirstListItem(`tmdb_id=${tmdbId} && media_type="${type}"`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Toggle watchlist status (separate collection)
   */
  async toggleWatchlist(tmdbId: number, media: MediaItem, type: 'movie' | 'tv'): Promise<boolean> {
    try {
      const existing = await this.pb.client.collection('watchlist').getFirstListItem<WatchlistRecord>(`tmdb_id=${tmdbId} && media_type="${type}"`);
      await this.pb.client.collection('watchlist').delete(existing.id);
      return false; // Removed
    } catch {
      // Not found, add it
      await this.pb.client.collection('watchlist').create({
        tmdb_id: tmdbId,
        media_type: type,
        title: media.title || media.name || 'Unknown',
        poster_path: media.poster_path
      });
      return true; // Added
    }
  }
}
