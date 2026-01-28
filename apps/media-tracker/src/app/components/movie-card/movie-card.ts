import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { WatchlistService } from '../../services/watchlist.service';
import { TmdbService } from '../../services/tmdb.service';
import { MediaItem } from '../../models/types';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css'
})
export class MovieCardComponent {
  @Input() movie!: MediaItem;
  @Input() type: 'movie' | 'tv' = 'movie';
  
  private router = inject(Router);
  private watchlist = inject(WatchlistService);
  private tmdb = inject(TmdbService);
  private toastr = inject(ToastrService);

  get posterUrl(): string {
    return this.tmdb.getImageUrl(this.movie.poster_path || this.movie.backdrop_path || null);
  }

  get title(): string {
    return this.movie.title || this.movie.name || 'Unknown';
  }

  goToDetails() {
    this.router.navigate(['/details', this.type, this.movie.id]);
  }

  async addToWatchlist(event: Event) {
    event.stopPropagation();
    try {
      await this.watchlist.add(this.movie, this.type);
      this.toastr.success(`Added "${this.title}" to watchlist`);
    } catch (error) {
      this.toastr.error('Failed to add to watchlist');
    }
  }
}
