import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.html',
  styleUrl: './details.scss'
})
export class DetailsComponent implements OnInit {
  item$!: Observable<any>;
  type: 'movie' | 'tv' = 'movie';
  isFavorite = false;
  
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private location = inject(Location);

  ngOnInit() {
    this.item$ = this.route.params.pipe(
      tap(params => this.type = params['type']),
      switchMap(params => this.api.getDetails(params['type'], params['id']))
    );
  }

  getYear(date: string) {
    return date ? new Date(date).getFullYear() : 'N/A';
  }

  track(action: 'watchlist' | 'seen' | 'favorite', item: any) {
    if (!item) return;

    if (action === 'watchlist') {
      this.api.addToWatchlist(item, this.type).then(() => alert('Added to Watchlist'));
    } else if (action === 'seen') {
      this.api.markAsSeen(item, this.type).then(() => alert('Marked as Seen'));
    } else if (action === 'favorite') {
      this.api.toggleFavorite(item, this.type).then(() => {
        this.isFavorite = !this.isFavorite; // Note: This local state might flip back on reload if not persisted/checked
      });
    }
  }

  goBack() {
    this.location.back();
  }
}
