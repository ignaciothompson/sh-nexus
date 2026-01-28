import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbService } from '../../services/tmdb.service';
import { MediaItem } from '../../models/types';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  releases: MediaItem[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  private tmdb = inject(TmdbService);

  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  upcomingReleases: MediaItem[] = [];

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  get currentMonthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  ngOnInit() {
    this.generateCalendar();
    this.loadUpcomingReleases();
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();

    this.calendarDays = [];

    // Add days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -firstDay.getDay() + i + 1);
      this.calendarDays.push({
        date: prevDate,
        day: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: false,
        releases: []
      });
    }

    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        releases: []
      });
    }

    // Fill remaining days
    const remaining = 42 - this.calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      this.calendarDays.push({
        date: nextDate,
        day: i,
        isCurrentMonth: false,
        isToday: false,
        releases: []
      });
    }
  }

  loadUpcomingReleases() {
    this.tmdb.getUpcomingMovies().subscribe((movies: MediaItem[]) => {
      this.upcomingReleases = movies.slice(0, 6);
      this.assignReleasesToDays(movies);
    });
  }

  assignReleasesToDays(releases: MediaItem[]) {
    releases.forEach(release => {
      const releaseDate = new Date(release.release_date || '');
      const dayEntry = this.calendarDays.find(d =>
        d.date.toDateString() === releaseDate.toDateString()
      );
      if (dayEntry) {
        dayEntry.releases.push(release);
      }
    });
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
    this.loadUpcomingReleases();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
    this.loadUpcomingReleases();
  }

  goToToday() {
    this.currentDate = new Date();
    this.generateCalendar();
    this.loadUpcomingReleases();
  }

  getImageUrl(path: string | null): string {
    return this.tmdb.getImageUrl(path, 'w200');
  }
}
