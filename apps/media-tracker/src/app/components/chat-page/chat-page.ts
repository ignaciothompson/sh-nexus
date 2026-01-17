import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.scss'
})
export class ChatPageComponent {
  genres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Documentary', 'Anime'];
  selectedGenres: string[] = [];
  
  searchQuery = '';
  selectedMovies: string[] = [];
  
  userInput = '';
  messages: { text: string, isUser: boolean }[] = [
    { text: "Hi! Select some preferences or just ask me for a recommendation.", isUser: false }
  ];
  isLoading = false;

  private api = inject(ApiService);

  toggleGenre(genre: string) {
    if (this.selectedGenres.includes(genre)) {
      this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
    } else {
      this.selectedGenres.push(genre);
    }
  }

  addContextItem(query: string) {
    if (query.trim()) {
      this.selectedMovies.push(query.trim());
      this.searchQuery = '';
    }
  }

  removeContextItem(item: string) {
    this.selectedMovies = this.selectedMovies.filter(i => i !== item);
  }

  clearContext() {
    this.selectedGenres = [];
    this.selectedMovies = [];
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const text = this.userInput;
    this.messages.push({ text, isUser: true });
    this.userInput = '';
    this.isLoading = true;

    const context = {
      genres: this.selectedGenres,
      movies: this.selectedMovies
    };

    this.api.getRecommendation(text, context).subscribe({
      next: (res) => {
        this.messages.push({ text: res.response, isUser: false });
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({ text: "Sorry, I couldn't get a recommendation right now.", isUser: false });
        this.isLoading = false;
      }
    });
  }
}
