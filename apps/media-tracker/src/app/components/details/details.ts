import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TmdbService } from '../../services/tmdb.service';
import { WatchlistService } from '../../services/watchlist.service';
import { FavoritesService } from '../../services/favorites.service';
import { HistoryService } from '../../services/history.service';
import { Observable, switchMap, tap } from 'rxjs';
import { Movie, TVShow } from '../../models/types';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.html',
  styleUrl: './details.css'
})
export class DetailsComponent implements OnInit {
  item$!: Observable<Movie | TVShow>;
  type: 'movie' | 'tv' = 'movie';
  isFavorite = false;
  
  private route = inject(ActivatedRoute);
  private tmdb = inject(TmdbService);
  private watchlist = inject(WatchlistService);
  private favorites = inject(FavoritesService);
  private history = inject(HistoryService);
  private toastr = inject(ToastrService);
  private location = inject(Location);

  ngOnInit() {
    this.item$ = this.route.params.pipe(
      tap(params => this.type = params['type']),
      switchMap(params => this.tmdb.getDetails(params['type'], params['id']))
    );
  }

  getYear(date: string | undefined): string | number {
    return date ? new Date(date).getFullYear() : 'N/A';
  }

  getPosterUrl(path: string | null): string {
    return this.tmdb.getImageUrl(path, 'w500');
  }

  async track(action: 'watchlist' | 'seen' | 'favorite', item: Movie | TVShow) {
    if (!item) return;

    try {
      if (action === 'watchlist') {
        await this.watchlist.add(item, this.type);
        this.toastr.success('Added to Watchlist');
      } else if (action === 'seen') {
        await this.history.markAsSeen(item, this.type);
        this.toastr.success('Marked as Seen');
      } else if (action === 'favorite') {
        const result = await this.favorites.toggle(item, this.type);
        this.isFavorite = result.added;
        this.toastr.success(result.added ? 'Added to Favorites' : 'Removed from Favorites');
      }
    } catch (error) {
      this.toastr.error('Action failed');
    }
  }

  goBack() {
    this.location.back();
  }
}
