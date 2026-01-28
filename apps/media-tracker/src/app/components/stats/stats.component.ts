import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { from } from 'rxjs';
import { HistoryService } from '../../services/history.service';

interface StatsData {
  totalWatched: number;
  hoursWatched: number;
  moviesWatched: number;
  seriesCompleted: number;
  avgRating: number;
  topGenre: string;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent implements OnInit {
  private historyService = inject(HistoryService);

  stats = {
    totalWatched: 247,
    hoursWatched: 892,
    moviesWatched: 156,
    seriesCompleted: 42,
    avgRating: 7.8,
    topGenre: 'Sci-Fi'
  };

  monthlyData = [
    { month: 'Jan', movies: 12, series: 4 },
    { month: 'Feb', movies: 15, series: 3 },
    { month: 'Mar', movies: 18, series: 5 },
    { month: 'Apr', movies: 14, series: 6 },
    { month: 'May', movies: 20, series: 4 },
    { month: 'Jun', movies: 16, series: 7 }
  ];

  genreBreakdown = [
    { genre: 'Sci-Fi', percentage: 28, color: '#FF9F1C' },
    { genre: 'Action', percentage: 22, color: '#3B82F6' },
    { genre: 'Drama', percentage: 18, color: '#22C55E' },
    { genre: 'Comedy', percentage: 15, color: '#A855F7' },
    { genre: 'Horror', percentage: 10, color: '#EF4444' },
    { genre: 'Other', percentage: 7, color: '#6B7280' }
  ];

  recentActivity = [
    { title: 'Dune: Part Two', type: 'Movie', date: '2 hours ago', rating: 9 },
    { title: 'The Bear', type: 'Series', date: 'Yesterday', rating: 8.5 },
    { title: 'Oppenheimer', type: 'Movie', date: '3 days ago', rating: 9.2 },
    { title: 'Shogun', type: 'Series', date: '5 days ago', rating: 8.8 }
  ];

  ngOnInit() {
    from(this.historyService.getStats()).subscribe((data: StatsData) => {
      if (data) {
        this.stats = { ...this.stats, ...data };
      }
    });
  }

  getMaxMonthlyValue(): number {
    return Math.max(...this.monthlyData.map(m => m.movies + m.series));
  }

  getBarHeight(value: number): number {
    return (value / this.getMaxMonthlyValue()) * 100;
  }
}
