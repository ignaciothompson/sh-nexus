import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  currentTime = new Date();
  searchQuery = '';
  
  constructor() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }
  
  performSearch() {
    if (this.searchQuery.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(this.searchQuery)}`, '_blank');
    }
  }
}

