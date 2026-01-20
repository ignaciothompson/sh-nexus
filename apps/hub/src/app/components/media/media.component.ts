import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent implements OnInit {
  // Media library stats
  stats = {
    movies: 0,
    tvShows: 0,
    music: 0,
    storage: '0 TB'
  };

  // Recent media
  recentMedia: MediaItem[] = [];

  // Active services
  services: MediaService[] = [];

  ngOnInit() {
    this.loadMediaStats();
    this.loadServices();
  }

  loadMediaStats() {
    // TODO: Integrate with Plex/Jellyfin/Emby API
    // Placeholder data
    this.stats = {
      movies: 450,
      tvShows: 125,
      music: 3200,
      storage: '8.5 TB'
    };

    this.recentMedia = [
      {
        title: 'The Matrix',
        type: 'movie',
        thumbnail: '',
        year: 1999
      },
      {
        title: 'Breaking Bad',
        type: 'tv',
        thumbnail: '',
        season: 5
      }
    ];
  }

  loadServices() {
    this.services = [
      { name: 'Plex', icon: 'smart_display', status: 'online', url: '' },
      { name: 'Radarr', icon: 'movie', status: 'online', url: '' },
      { name: 'Sonarr', icon: 'tv', status: 'online', url: '' },
      { name: 'qBittorrent', icon: 'download', status: 'online', url: '' }
    ];
  }

  openService(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }
}

interface MediaItem {
  title: string;
  type: 'movie' | 'tv' | 'music';
  thumbnail: string;
  year?: number;
  season?: number;
}

interface MediaService {
  name: string;
  icon: string;
  status: 'online' | 'offline';
  url: string;
}
