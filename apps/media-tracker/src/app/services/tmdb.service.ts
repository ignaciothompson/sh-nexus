import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { MediaItem, Movie, TVShow, TMDBResponse, SeasonDetails } from '../models/types';

/**
 * TMDB API Service
 * Handles all calls to The Movie Database API
 */
@Injectable({ providedIn: 'root' })
export class TmdbService {
  private apiKey = environment.tmdbApiKey;
  private baseUrl = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient) {}

  /**
   * Get popular movies
   */
  getPopularMovies(): Observable<MediaItem[]> {
    return this.http
      .get<TMDBResponse<MediaItem>>(
        `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=en-US&page=1`
      )
      .pipe(
        map((res) =>
          res.results.map((item) => ({ ...item, media_type: 'movie' as const }))
        )
      );
  }

  /**
   * Get popular TV shows
   */
  getPopularTV(): Observable<MediaItem[]> {
    return this.http
      .get<TMDBResponse<MediaItem>>(
        `${this.baseUrl}/tv/popular?api_key=${this.apiKey}&language=en-US&page=1`
      )
      .pipe(
        map((res) =>
          res.results.map((item) => ({ ...item, media_type: 'tv' as const }))
        )
      );
  }

  /**
   * Get upcoming movies
   */
  getUpcomingMovies(): Observable<MediaItem[]> {
    return this.http
      .get<TMDBResponse<MediaItem>>(
        `${this.baseUrl}/movie/upcoming?api_key=${this.apiKey}&language=en-US&page=1`
      )
      .pipe(
        map((res) =>
          res.results.map((item) => ({ ...item, media_type: 'movie' as const }))
        )
      );
  }

  /**
   * Search for movies, TV shows, and people
   */
  searchMedia(query: string): Observable<MediaItem[]> {
    return this.http
      .get<TMDBResponse<MediaItem>>(
        `${this.baseUrl}/search/multi?api_key=${this.apiKey}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
      )
      .pipe(map((res) => res.results));
  }

  /**
   * Get detailed information about a movie or TV show
   */
  getDetails(type: 'movie' | 'tv', id: number): Observable<Movie | TVShow> {
    return this.http.get<Movie | TVShow>(
      `${this.baseUrl}/${type}/${id}?api_key=${this.apiKey}&language=en-US`
    );
  }

  /**
   * Get season details (episodes)
   */
  getSeasonDetails(tvId: number, seasonNumber: number): Observable<SeasonDetails> {
    return this.http.get<SeasonDetails>(
      `${this.baseUrl}/tv/${tvId}/season/${seasonNumber}?api_key=${this.apiKey}&language=en-US`
    );
  }

  /**
   * Get image URL for a poster/backdrop
   */
  getImageUrl(path: string | null, size: 'w200' | 'w500' | 'original' = 'w500'): string {
    if (!path) return '/assets/no-poster.png';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}
