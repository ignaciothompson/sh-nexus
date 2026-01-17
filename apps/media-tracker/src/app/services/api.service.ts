import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, map, of } from 'rxjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  name?: string; // For TV shows
}

export interface ChatResponse {
  response: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private supabase: SupabaseClient;
  private tmdbApiKey = environment.tmdbApiKey;
  private tmdbBaseUrl = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // --- TMDB API ---

  getPopularMovies(): Observable<any> {
    return this.http.get<any>(`${this.tmdbBaseUrl}/movie/popular?api_key=${this.tmdbApiKey}&language=en-US&page=1`);
  }

  getPopularTV(): Observable<any> {
    return this.http.get<any>(`${this.tmdbBaseUrl}/tv/popular?api_key=${this.tmdbApiKey}&language=en-US&page=1`);
  }

  searchMedia(query: string): Observable<any> {
    return this.http.get<any>(`${this.tmdbBaseUrl}/search/multi?api_key=${this.tmdbApiKey}&language=en-US&query=${query}&page=1&include_adult=false`);
  }

  getDetails(type: 'movie' | 'tv', id: number): Observable<any> {
    return this.http.get<any>(`${this.tmdbBaseUrl}/${type}/${id}?api_key=${this.tmdbApiKey}&language=en-US`);
  }

  // --- AI Chat ---

  getRecommendation(message: string, context?: { genres?: string[], movies?: string[] }): Observable<ChatResponse> {
    // Mock AI response with context awareness
    let contextStr = '';
    if (context?.genres?.length) contextStr += ` [Genres: ${context.genres.join(', ')}]`;
    if (context?.movies?.length) contextStr += ` [Liked: ${context.movies.join(', ')}]`;
    
    const mockResponse = `(AI Context${contextStr}) Based on your request "${message}", I recommend checking out 'The Matrix' or 'Stranger Things'.`;
    return of({ response: mockResponse });
  }

  // --- Supabase Tracking ---

  async addToWatchlist(item: any, type: 'movie' | 'tv' = 'movie') {
    const { data, error } = await this.supabase
      .from('watchlist')
      .insert([
        { 
          media_id: item.id, 
          title: item.title || item.name, 
          poster_path: item.poster_path,
          media_type: type
        },
      ]);
    if (error) console.error('Supabase addToWatchlist error:', error);
    return { data, error };
  }

  async markAsSeen(item: any, type: 'movie' | 'tv') {
    // Basic defensive check for runtime
    const runtime = item.runtime || (item.episode_run_time ? item.episode_run_time[0] : 0);
    
    const { data, error } = await this.supabase
      .from('seen_history')
      .insert([
        { 
          media_id: item.id, 
          title: item.title || item.name, 
          poster_path: item.poster_path,
          media_type: type,
          runtime: runtime, 
          genres: item.genres?.map((g: any) => g.name) || [],
          watched_at: new Date()
        },
      ]);
    if (error) console.error('Supabase markAsSeen error:', error);
    return { data, error };
  }

  async toggleFavorite(item: any, type: 'movie' | 'tv') {
    // Check if already favorite
    const { data: existing, error: fetchError } = await this.supabase
      .from('favorites')
      .select('*')
      .eq('media_id', item.id)
      .eq('media_type', type)
      .maybeSingle();

    if (fetchError) console.error('Supabase toggleFavorite fetch error:', fetchError);

    if (existing) {
      return await this.supabase.from('favorites').delete().eq('id', existing.id);
    } else {
      return await this.supabase.from('favorites').insert([{
        media_id: item.id, 
        title: item.title || item.name, 
        poster_path: item.poster_path,
        media_type: type
      }]);
    }
  }

  async getSeenHistory() {
    return await this.supabase
      .from('seen_history')
      .select('*')
      .order('watched_at', { ascending: false });
  }

  async getFavorites() {
    return await this.supabase
      .from('favorites')
      .select('*');
  }
}
