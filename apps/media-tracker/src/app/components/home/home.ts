import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { MovieCardComponent } from '../movie-card/movie-card';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  movies$!: Observable<any[]>;
  tvShows$!: Observable<any[]>;
  recommended$!: Observable<any[]>;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.movies$ = this.api.getPopularMovies().pipe(
      map(res => res.results || [])
    );

    this.tvShows$ = this.api.getPopularTV().pipe(
      map(res => res.results || [])
    );

    // Reuse the movies observable for recommendations (with shuffle)
    this.recommended$ = this.movies$.pipe(
      map(movies => [...movies].sort(() => 0.5 - Math.random()).slice(0, 4))
    );
  }
}

