import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbService } from '../../services/tmdb.service';
import { MovieTrackerService } from '../../services/movie-tracker.service';
import { DialogService } from '../../services/dialog.service';
import { MediaModalComponent } from '../modals/media-modal/media-modal.component';
import { MediaItem, TrackedMovie } from '../../models/types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private tmdb = inject(TmdbService);
  private movieTracker = inject(MovieTrackerService);
  private dialogService = inject(DialogService);

  currentlyWatching: MediaItem[] = [];
  watchlist: TrackedMovie[] = [];
  recentlyAdded: MediaItem[] = [];

  ngOnInit() {
    this.loadCurrentlyWatching();
    this.loadWatchlist();
    this.loadRecentlyAdded();
  }

  private loadCurrentlyWatching() {
    // For now, use popular movies as placeholder
    this.tmdb.getPopularMovies().subscribe(movies => {
      this.currentlyWatching = movies.slice(0, 3);
    });
  }

  private async loadWatchlist() {
    try {
      this.watchlist = await this.movieTracker.getByStatus('watchlist', 'all');
    } catch {
      this.watchlist = [];
    }
  }

  private loadRecentlyAdded() {
    // Using upcoming movies from TMDB as placeholder for Jellyfin integration
    this.tmdb.getUpcomingMovies().subscribe({
      next: (movies: MediaItem[]) => {
        if (movies && movies.length > 0) {
          this.recentlyAdded = movies.slice(0, 6);
        } else {
          this.loadPopularFallback();
        }
      },
      error: () => {
        this.loadPopularFallback();
      }
    });
  }

  private loadPopularFallback() {
    this.tmdb.getPopularMovies().subscribe((movies: MediaItem[]) => {
      this.recentlyAdded = movies.slice(6, 12);
    });
  }

  getImageUrl(path: string | null): string {
    return this.tmdb.getImageUrl(path, 'w500');
  }

  getTitle(item: MediaItem | TrackedMovie): string {
    return item.title || (item as MediaItem).name || 'Unknown';
  }

  openMediaModal(item: MediaItem | TrackedMovie, mediaType: 'movie' | 'tv' = 'movie') {
    const mediaId = 'tmdb_id' in item ? item.tmdb_id : item.id;
    const type = (item as MediaItem).media_type || mediaType;
    
    this.dialogService.open(MediaModalComponent, {
      data: {
        mediaId,
        mediaType: type,
      },
      size: 'lg'
    });
  }
}
