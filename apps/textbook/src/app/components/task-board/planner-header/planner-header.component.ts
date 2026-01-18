import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-planner-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planner-header.component.html',
  styleUrls: ['./planner-header.component.css']
})
export class PlannerHeaderComponent {
  @Output() newCard = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();

  searchQuery = '';
  showFilterMenu = false;
  selectedFilter: 'all' | 'high' | 'medium' | 'low' = 'all';

  onSearchChange(): void {
    this.search.emit(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.search.emit('');
  }

  toggleFilterMenu(): void {
    this.showFilterMenu = !this.showFilterMenu;
  }

  selectFilter(filter: 'all' | 'high' | 'medium' | 'low'): void {
    this.selectedFilter = filter;
    this.showFilterMenu = false;
    // TODO: Implement filter logic
  }

  onNewCard(): void {
    this.newCard.emit();
  }
}
