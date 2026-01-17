import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics.html',
  styleUrl: './metrics.scss'
})
export class MetricsComponent implements OnInit {
  stats = { movies: 0, episodes: 0, hours: 0, total: 0 };
  genreCounts: {name: string, count: number}[] = [];
  recentHistory: any[] = [];

  private api = inject(ApiService);
  private location = inject(Location);

  ngOnInit() {
    this.api.getSeenHistory().then(({ data, error }) => {
      if (error) {
        console.error('Error fetching history:', error);
      }
      if (data) {
        this.processData(data);
      }
    });
  }

  processData(history: any[]) {
    this.recentHistory = history.slice(0, 10);
    
    // Stats
    this.stats.movies = history.filter(h => h.media_type === 'movie').length;
    this.stats.episodes = history.filter(h => h.media_type === 'tv').length; // Assuming each entry is an episode or show watch
    this.stats.total = history.length;
    
    // Calculate hours (Assuming runtime is in minutes)
    const totalMinutes = history.reduce((acc, curr) => acc + (curr.runtime || 0), 0);
    this.stats.hours = totalMinutes / 60;

    // Genres
    const genreMap: Record<string, number> = {};
    history.forEach(h => {
      if (h.genres && Array.isArray(h.genres)) {
        h.genres.forEach((g: string) => {
          genreMap[g] = (genreMap[g] || 0) + 1;
        });
      }
    });
    
    this.genreCounts = Object.entries(genreMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  goBack() {
    this.location.back();
  }
}
