import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss'
})
export class MovieCardComponent {
  @Input() movie: any;
  @Input() type: 'movie' | 'tv' = 'movie';
  
  private router = inject(Router);
  private api = inject(ApiService);

  goToDetails() {
    this.router.navigate(['/details', this.type, this.movie.id]);
  }

  addToWatchlist(event: Event) {
    event.stopPropagation();
    this.api.addToWatchlist(this.movie, this.type);
    // Optional: Add toast notification here
  }
}
