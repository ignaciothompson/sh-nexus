import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TmdbService } from '../../services/tmdb.service';
import { DialogService } from '../../services/dialog.service';
import { MediaModalComponent } from '../modals/media-modal/media-modal.component';
import { MediaItem } from '../../models/types';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './series.component.html',
  styleUrl: './series.component.css'
})
export class SeriesComponent implements OnInit {
  private tmdb = inject(TmdbService);
  private dialogService = inject(DialogService);

  series: MediaItem[] = [];
  searchQuery = '';
  selectedGenre = 'all';
  selectedStatus = 'all';
  sortBy = 'popular';
  viewMode: 'grid' | 'list' = 'grid';

  genres = [
    { id: 'all', name: 'All Genres' },
    { id: '10759', name: 'Action & Adventure' },
    { id: '35', name: 'Comedy' },
    { id: '18', name: 'Drama' },
    { id: '10765', name: 'Sci-Fi & Fantasy' },
    { id: '80', name: 'Crime' }
  ];

  statuses = ['all', 'Airing', 'Ended', 'Upcoming'];

  ngOnInit() {
    this.loadSeries();
  }

  loadSeries() {
    this.tmdb.getPopularTV().subscribe((shows: MediaItem[]) => {
      this.series = shows;
    });
  }

  openMediaModal(show: MediaItem) {
    this.dialogService.open(MediaModalComponent, {
      data: {
        mediaId: show.id,
        mediaType: 'tv'
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
