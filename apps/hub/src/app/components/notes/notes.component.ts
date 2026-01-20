import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent {
  // Quick stats
  stats = {
    totalNotes: 45,
    favoriteNotes: 12,
    plannerItems: 23,
    completedTasks: 18
  };

  // Recent notes
  recentNotes = [
    {
      title: 'Project Ideas',
      preview: 'New features for the dashboard...',
      updated: new Date(2026, 0, 18),
      isFavorite: true
    },
    {
      title: 'Meeting Notes',
      preview: 'Discussed the roadmap for Q1...',
      updated: new Date(2026, 0, 17),
      isFavorite: false
    },
    {
      title: 'Bug Tracker',
      preview: 'List of known issues and their status...',
      updated: new Date(2026, 0, 16),
      isFavorite: true
    }
  ];

  openTextbookApp() {
    // Redirect to Textbook app
    window.open('https://textbook.sh-nexus.com', '_blank');
  }

  openNotes() {
    window.open('https://textbook.sh-nexus.com/notes', '_blank');
  }

  openPlanner() {
    window.open('https://textbook.sh-nexus.com/planner', '_blank');
  }

  openBooks() {
    window.open('https://textbook.sh-nexus.com/books', '_blank');
  }
}
