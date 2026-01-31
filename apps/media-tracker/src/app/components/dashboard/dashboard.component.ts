import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { MovieTrackerService } from '../../services/movie-tracker.service';
import { DialogService } from '../../services/dialog.service';
import { MediaModalComponent } from '../modals/media-modal/media-modal.component';
import {
  MediaItem,
  TrackedMovie,
  WatchlistRecord,
  CurrentlyWatchingRecord,
} from '../../models/types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private tmdb = inject(TmdbService);
  private movieTracker = inject(MovieTrackerService);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentlyWatching: any[] = [];
  watchlist: WatchlistRecord[] = [];
  recentlyAdded: MediaItem[] = [];

  ngOnInit() {
    this.loadCurrentlyWatching();
    this.loadWatchlist();
  }

  discover() {
    this.router.navigate(['/search']);
  }

  private async loadCurrentlyWatching() {
    try {
      this.currentlyWatching = await this.movieTracker.getCurrentlyWatching();
      console.log('Dashboard: Currently watching loaded', this.currentlyWatching);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Dashboard: Currently watching load error', error);
      this.currentlyWatching = [];
      this.cdr.detectChanges();
    }
  }

  private async loadWatchlist() {
    try {
      this.watchlist = await this.movieTracker.getWatchlist();
      console.log('Dashboard: Watchlist loaded', this.watchlist);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Dashboard: Watchlist load error', error);
      this.watchlist = [];
      this.cdr.detectChanges();
    }
  }

  getImageUrl(path: string | null): string {
    return this.tmdb.getImageUrl(path, 'w500');
  }

  getTitle(item: MediaItem | TrackedMovie | WatchlistRecord): string {
    return (item as any).title || (item as any).name || 'Unknown';
  }

  openMediaModal(
    item: MediaItem | TrackedMovie | WatchlistRecord,
    mediaType: 'movie' | 'tv' = 'movie',
  ) {
    const mediaId = 'tmdb_id' in item ? item.tmdb_id : item.id;
    // WatchlistRecord has media_type. TrackedMovie has optional media_type. MediaItem has optional media_type.
    const type = (item as any).media_type || mediaType;

    this.dialogService.open(MediaModalComponent, {
      data: {
        mediaId,
        mediaType: type,
      },
      size: 'lg',
    });
  }

  playShow(item: any, event: Event) {
    event.stopPropagation();
    console.log('Play button clicked:', item);
    
    if (!item.platform) {
      console.warn('No platform set for this item');
      return;
    }

    const title = encodeURIComponent(item.title);
    const platformUrls: Record<number, string> = {
      1: `https://pelis.ignaciothompson.com/web/index.html#!/search.html?query=${title}`, // Jellyfin
      2: `https://www.netflix.com/search?q=${title}`, // Netflix
      3: `https://www.paramountplus.com/search/${title}`, // Paramount
      4: `https://www.disneyplus.com/search?q=${title}`, // Disney
      5: `https://www.primevideo.com/search?phrase=${title}`, // Prime
    };

    const url = platformUrls[item.platform];
    console.log('Opening URL:', url, 'for platform:', item.platform);
    
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error('Invalid platform ID:', item.platform);
    }
  }

  async markEpisodeCompleted(item: any, event: Event) {
    event.stopPropagation();
    console.log('markEpisodeCompleted called with item:', item);
    
    if (!item.last_season || !item.last_episode) {
      console.error('Cannot mark episode - missing season/episode info. last_season:', item.last_season, 'last_episode:', item.last_episode);
      console.log('Full item data:', JSON.stringify(item, null, 2));
      return;
    }

    try {
      console.log('Marking next episode as watched. Current: S' + item.last_season + 'E' + item.last_episode);
      
      // Calculate next episode
      const nextEpisode = item.last_episode + 1;
      console.log('Next episode will be: S' + item.last_season + 'E' + nextEpisode);
      
      // Mark the next episode as watched
      await this.movieTracker.toggleEpisode(
        item.tmdb_id,
        item.last_season,
        nextEpisode,
        item.total_episodes,
        item // Pass the item as media
      );
      
      console.log('Episode marked successfully, reloading list...');
      
      // Reload the list to reflect changes
      await this.loadCurrentlyWatching();
      
      console.log('List reloaded');
    } catch (error) {
      console.error('Failed to mark episode as watched', error);
    }
  }
}
