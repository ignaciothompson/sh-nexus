import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { TmdbService } from '../../../services/tmdb.service';
import { MovieTrackerService } from '../../../services/movie-tracker.service';
import { DialogService } from '../../../services/dialog.service';
import { ListSelectorModalComponent } from '../list-selector-modal/list-selector-modal.component';
import { TrackedMovie, Movie, TVShow, SeasonSummary, Episode } from '../../../models/types';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

export interface MediaModalData {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

interface MovieCredits {
  cast: { name: string; character: string; profile_path: string | null }[];
  crew: { name: string; job: string }[];
}

interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

@Component({
  selector: 'app-media-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-modal.component.html',
  styleUrl: './media-modal.component.css'
})
export class MediaModalComponent implements OnInit {
  private dialogRef = inject(DialogRef);
  private data = inject<MediaModalData>(DIALOG_DATA);
  private tmdb = inject(TmdbService);
  private movieTracker = inject(MovieTrackerService);
  private dialogService = inject(DialogService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  media: Movie | TVShow | null = null;
  credits: MovieCredits | null = null;
  watchProviders: WatchProvider[] = [];
  trackedMovie: TrackedMovie | null = null;
  loading = true;
  
  showSeasons: (SeasonSummary & { episodes?: Episode[], expanded?: boolean })[] = [];
  episodesLoading = false;

  // Status flags for UI
  isFavourite = false;
  isInWatchlist = false;
  isWatched = false;

  ngOnInit() {
    this.loadMediaDetails();
  }

  private loadMediaDetails(): void {
    this.loading = true;
    
    console.log('MediaModal: Loading details for', this.data.mediaType, this.data.mediaId);
    
    this.tmdb.getDetails(this.data.mediaType, this.data.mediaId).subscribe({
      next: async (media: Movie | TVShow) => {
        try {
          console.log('MediaModal: Details loaded', media);
          this.media = media;
          
          if (this.data.mediaType === 'tv') {
            this.showSeasons = (media as TVShow).seasons?.map(s => ({ ...s, expanded: false, episodes: [] })) || [];
          }
          
          // Create a timeout promise to prevent hanging
          const timeoutMs = 3000;
          const timeoutPromise = new Promise<void>((_, reject) => 
            setTimeout(() => reject(new Error('Data loading timed out')), timeoutMs)
          );

          // Wrap data loading in a promise we can race
          const loadDataPromise = async () => {
            console.log('MediaModal: Loading credits...');
            await this.loadCredits();
            
            console.log('MediaModal: Loading watch providers...');
            await this.loadWatchProviders();
            
            console.log('MediaModal: Loading tracked status...');
            await this.loadTrackedStatus();
          };

          // Race data loading against timeout
          await Promise.race([loadDataPromise(), timeoutPromise]);
          
          console.log('MediaModal: All data loaded');
        } catch (err) {
          console.error('MediaModal: Error in async data loading', err);
          // If it was a timeout, we still have the media details, so just show what we have
          if ((err as Error).message === 'Data loading timed out') {
             this.toastr.warning('Some data took too long to load');
          } else {
             this.toastr.error('Failed to load additonal media data');
          }
        } finally {
          this.loading = false;
          console.log('MediaModal: Loading set to false');
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('MediaModal: TMDB API Error', err);
        // Even on error, stop loading so user can close or retry
        this.loading = false;
        this.toastr.error('Failed to load media details');
      }
    });
  }

  private async loadCredits(): Promise<void> {
    // Placeholder - in real implementation, would call TMDB credits endpoint
    this.credits = null;
    return Promise.resolve();
  }

  private async loadWatchProviders(): Promise<void> {
    // Placeholder - in real implementation, would call TMDB watch providers endpoint
    this.watchProviders = [];
  }

  private async loadTrackedStatus(): Promise<void> {
    this.trackedMovie = await this.movieTracker.getByTmdbId(this.data.mediaId, this.data.mediaType);
    if (this.trackedMovie) {
      this.isFavourite = this.trackedMovie.status?.favourite ?? false;
      this.isInWatchlist = this.trackedMovie.status?.watchlist ?? false;
      this.isWatched = this.trackedMovie.status?.watched ?? false;
    }
  }

  // Helper methods
  getImageUrl(path: string | null | undefined, size = 'w500'): string {
    return this.tmdb.getImageUrl(path || null, size as 'w200' | 'w500' | 'original');
  }

  getTitle(): string {
    return this.media?.title || (this.media as unknown as TVShow)?.name || 'Unknown';
  }

  getYear(): string {
    const date = this.media?.release_date || (this.media as unknown as TVShow)?.first_air_date;
    return date ? date.substring(0, 4) : '';
  }

  getRuntime(): string {
    if (!this.media) return '';
    const runtime = (this.media as Movie).runtime || (this.media as unknown as TVShow).episode_run_time?.[0] || 0;
    
    if (!runtime) return '';
    const hours = Math.floor(runtime / 60);
    const mins = runtime % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  getGenres(): string {
    return this.media?.genres?.map(g => g.name).join(' • ') || '';
  }

  getDirector(): string {
    return this.credits?.crew?.find(c => c.job === 'Director')?.name || '';
  }

  getCast(): string[] {
    return this.credits?.cast?.slice(0, 5).map(c => c.name) || [];
  }

  // Action handlers
  async toggleFavourite(): Promise<void> {
    if (!this.media) return;
    try {
      this.trackedMovie = await this.movieTracker.toggleStatus(
        this.data.mediaId, 
        'favourite', 
        this.media!,
        this.data.mediaType
      );
      this.isFavourite = this.trackedMovie.status.favourite;
      this.toastr.success(this.isFavourite ? 'Added to favourites' : 'Removed from favourites');
    } catch {
      this.toastr.error('Failed to update favourite status');
    } finally {
      this.cdr.detectChanges();
    }
  }

  async toggleWatchlist(): Promise<void> {
    if (!this.media) return;
    try {
      this.trackedMovie = await this.movieTracker.toggleStatus(
        this.data.mediaId, 
        'watchlist', 
        this.media!,
        this.data.mediaType
      );
      this.isInWatchlist = this.trackedMovie.status.watchlist;
      this.toastr.success(this.isInWatchlist ? 'Added to watchlist' : 'Removed from watchlist');
    } catch {
      this.toastr.error('Failed to update watchlist');
    } finally {
      this.cdr.detectChanges();
    }
  }

  openAddToList(): void {
    this.dialogService.open(ListSelectorModalComponent, {
      data: {
        tmdbId: this.data.mediaId,
        mediaType: this.data.mediaType,
        title: this.getTitle(),
        posterPath: this.media?.poster_path || null,
      },
      size: 'sm'
    });
  }

  async markAsWatched(): Promise<void> {
    if (!this.media) return;
    try {
      this.trackedMovie = await this.movieTracker.markWatched(this.data.mediaId, this.media!, this.data.mediaType);
      this.isWatched = true;
      this.toastr.success('Marked as watched!');
    } catch {
      this.toastr.error('Failed to mark as watched');
    } finally {
      this.cdr.detectChanges();
    }
  }

  openStreamingService(providerName: string): void {
    const title = encodeURIComponent(this.getTitle());
    const urls: Record<string, string> = {
      'Netflix': `https://www.netflix.com/search?q=${title}`,
      'Amazon Prime Video': `https://www.primevideo.com/search?phrase=${title}`,
      'Disney Plus': `https://www.disneyplus.com/search?q=${title}`,
      'HBO Max': `https://www.max.com/search?q=${title}`,
      'Apple TV Plus': `https://tv.apple.com/search?term=${title}`,
    };
    const url = urls[providerName] || `https://www.google.com/search?q=${title}+watch+online`;
    window.open(url, '_blank');
  }

  openJellyfin(): void {
    const title = encodeURIComponent(this.getTitle());
    window.open(`https://jellyfin.sh-nexus.com/web/index.html#!/search.html?query=${title}`, '_blank');
  }

  async toggleSeason(season: any) {
    if (season.expanded) {
      season.expanded = false;
      return;
    }

    this.showSeasons.forEach(s => { 
        if(s !== season) s.expanded = false; 
    });

    season.expanded = true;

    if (!season.episodes || season.episodes.length === 0) {
      this.episodesLoading = true;
      try {
        const details = await firstValueFrom(this.tmdb.getSeasonDetails(this.data.mediaId, season.season_number));
        season.episodes = details.episodes;
      } catch (err) {
        this.toastr.error('Failed to load episodes');
      } finally {
        this.episodesLoading = false;
        this.cdr.detectChanges();
      }
    }
  }

  isEpisodeWatched(seasonNum: number, episodeNum: number): boolean {
    if (!this.trackedMovie?.watched_episodes) return false;
    return this.trackedMovie.watched_episodes.includes(`S${seasonNum}E${episodeNum}`);
  }

  async toggleEpisode(seasonNum: number, episodeNum: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    if (this.episodesLoading) return;
    
    if (!this.trackedMovie) {
       try {
           this.trackedMovie = await this.movieTracker.track(this.media!, 'tv', { watchlist: true });
       } catch {
           this.toastr.error('Could not track show');
           return;
       }
    }

    try {
      this.trackedMovie = await this.movieTracker.toggleEpisode(this.data.mediaId, seasonNum, episodeNum);
      this.toastr.success('Progress updated');
    } catch (e) {
      this.toastr.error('Failed to update progress');
    } finally {
      this.cdr.detectChanges();
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
