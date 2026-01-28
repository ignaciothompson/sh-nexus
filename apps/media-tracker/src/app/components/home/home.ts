import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbService } from '../../services/tmdb.service';
import { MovieCardComponent } from '../movie-card/movie-card';
import { Observable, map } from 'rxjs';
import { MediaItem } from '../../models/types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  movies$!: Observable<MediaItem[]>;
  tvShows$!: Observable<MediaItem[]>;
  recommended$!: Observable<MediaItem[]>;

  constructor(private tmdb: TmdbService) {}

  ngOnInit() {
    this.movies$ = this.tmdb.getPopularMovies();
    this.tvShows$ = this.tmdb.getPopularTV();

    // Reuse the movies observable for recommendations (with shuffle)
    this.recommended$ = this.movies$.pipe(
      map(movies => [...movies].sort(() => 0.5 - Math.random()).slice(0, 4))
    );
  }
}
