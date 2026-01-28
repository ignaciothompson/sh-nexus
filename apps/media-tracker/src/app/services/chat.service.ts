import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChatResponse, ChatContext } from '../models/types';

/**
 * Chat Service
 * Handles AI recommendation chat functionality
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  /**
   * Get a recommendation based on user message and context
   * Currently returns a mock response - can be replaced with actual AI API
   */
  getRecommendation(message: string, context?: ChatContext): Observable<ChatResponse> {
    let contextStr = '';
    if (context?.genres?.length) {
      contextStr += ` [Genres: ${context.genres.join(', ')}]`;
    }
    if (context?.movies?.length) {
      contextStr += ` [Liked Movies: ${context.movies.join(', ')}]`;
    }
    if (context?.tvShows?.length) {
      contextStr += ` [Liked Shows: ${context.tvShows.join(', ')}]`;
    }

    // Mock AI response - replace with actual AI API call
    const mockResponse = `Based on your request "${message}"${contextStr}, I recommend checking out these options:\n\n` +
      `• "The Matrix" - A mind-bending sci-fi classic\n` +
      `• "Stranger Things" - Perfect blend of 80s nostalgia and supernatural mystery\n` +
      `• "Inception" - Christopher Nolan's dream heist masterpiece`;

    return of({ response: mockResponse });
  }
}
