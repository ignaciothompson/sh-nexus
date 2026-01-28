/**
 * Media Tracker - Type Definitions
 * Central type definitions for the application
 */

// Base model for PocketBase records
export interface BaseModel {
  id: string;
  created: string;
  updated: string;
}

// TMDB API Types
export interface MediaItem {
  id: number;
  title?: string;
  name?: string; // For TV shows
  poster_path: string | null;
  backdrop_path?: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count?: number;
  media_type?: 'movie' | 'tv';
  genre_ids?: number[];
  popularity?: number;
}

export interface Movie extends MediaItem {
  title: string;
  release_date: string;
  runtime?: number;
  budget?: number;
  revenue?: number;
  genres?: Genre[];
  tagline?: string;
}

export interface TVShow extends MediaItem {
  name: string;
  first_air_date: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  genres?: Genre[];
  tagline?: string;
  seasons?: SeasonSummary[];
}

export interface SeasonSummary {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
}

export interface SeasonDetails {
  _id: string; // Internal ID
  air_date: string;
  episodes: Episode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string;
  season_number: number;
  vote_average: number;
}

export interface Episode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// PocketBase Tracking Types

// Status object for tracking state
export interface MediaStatus {
  favourite: boolean;
  watchlist: boolean;
  watched: boolean;
}

// Tracked Movie (cached TMDB data + user tracking)
export interface TrackedMovie extends BaseModel {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  tagline: string | null;
  runtime: number;
  release_date: string | null;
  vote_average: number;
  genres: string[];
  status: MediaStatus;
  personal_rating: number | null;
  watch_count: number;
  last_watch_date: string | null;
  media_type?: 'movie' | 'tv';
  watched_episodes?: string[];
}

// Episode tracking (embedded in seasons)
export interface TrackedEpisode {
  episode_number: number;
  title: string;
  runtime: number;
  release_date: string | null;
  watched: boolean;
  watch_count: number;
  last_watch_date: string | null;
  personal_rating: number | null;
}

// Season with embedded episodes
export interface TrackedSeason {
  season_number: number;
  episodes: TrackedEpisode[];
}

// Tracked TV Show (cached TMDB data + embedded seasons/episodes)
export interface TrackedTVShow extends BaseModel {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  tagline: string | null;
  vote_average: number;
  total_seasons: number;
  total_episodes: number;
  genres: string[];
  status: MediaStatus;
  personal_rating: number | null;
  show_watch_count: number;
  seasons: TrackedSeason[];
}

// List item (embedded in lists)
export interface ListItem {
  media_type: 'movie' | 'tv';
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  position: number;
  added_at: string;
  notes: string | null;
}

// Custom user list
export interface UserList extends BaseModel {
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  is_public: boolean;
  sort_order: number;
  items: ListItem[];
}

// Cached reference to last watched media
export interface LastWatchedRef {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  watched_at: string;
}

// User data (preferences + currently watching)
export interface UserData extends BaseModel {
  movie_genres: string[];
  show_genres: string[];
  currently_watching_movies: number[];
  currently_watching_shows: number[];
  last_watched_movie: LastWatchedRef | null;
  last_watched_show: LastWatchedRef | null;
}

// Legacy types kept for backwards compatibility during transition
export interface WatchlistItem extends BaseModel {
  media_id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
}

export interface FavoriteItem extends BaseModel {
  media_id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
}

export interface SeenHistoryItem extends BaseModel {
  media_id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  runtime: number;
  genres: string[];
  watched_at: string;
}

// AI Chat Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  genres?: string[];
  movies?: string[];
  tvShows?: string[];
}

export interface ChatResponse {
  response: string;
}

// UI State Types
export interface MediaCardData {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  media_type: 'movie' | 'tv';
}

