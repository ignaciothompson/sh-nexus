import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TmdbService } from '../../services/tmdb.service';
import { DialogService } from '../../services/dialog.service';
import { MediaModalComponent } from '../modals/media-modal/media-modal.component';
import { MediaItem } from '../../models/types';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css'
})
export class MoviesComponent implements OnInit {
  private tmdb = inject(TmdbService);
  private dialogService = inject(DialogService);

  movies: MediaItem[] = [];
  searchQuery = '';
  selectedGenre = 'all';
  selectedYear = 'all';
  sortBy = 'popular';
  viewMode: 'grid' | 'list' = 'grid';

  genres = [
    { id: 'all', name: 'All Genres' },
    { id: '28', name: 'Action' },
    { id: '35', name: 'Comedy' },
    { id: '18', name: 'Drama' },
    { id: '27', name: 'Horror' },
    { id: '878', name: 'Sci-Fi' },
    { id: '53', name: 'Thriller' }
  ];

  years = ['all', '2024', '2023', '2022', '2021', '2020'];

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    this.tmdb.getPopularMovies().subscribe(movies => {
      this.movies = movies;
    });
  }

  openMediaModal(movie: MediaItem) {
    this.dialogService.open(MediaModalComponent, {
      data: {
        mediaId: movie.id,
        mediaType: 'movie'
      },
      size: 'lg'
    });
  }

  getImageUrl(path: string | null): string {
    return this.tmdb.getImageUrl(path, 'w500');
  }

  getRating(vote: number): string {
    return vote.toFixed(1);
  }
}
