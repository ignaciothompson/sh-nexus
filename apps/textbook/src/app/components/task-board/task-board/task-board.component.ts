import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlannerService } from '../../../services/planner.service';
import { PlannerItem } from '../../../models/types';
import { PlannerHeaderComponent } from '../planner-header/planner-header.component';
import { CardModalComponent } from '../../modals/card-modal/card-modal.component';

interface Column {
  id: PlannerItem['status'];
  title: string;
  icon: string;
  color: string;
  tasks: PlannerItem[];
}

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, FormsModule, PlannerHeaderComponent, CardModalComponent],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.css'
})
export class TaskBoardComponent implements OnInit {
  columns: Column[] = [
    { id: 'blocked', title: 'BLOCKED', icon: '🚫', color: '#ef4444', tasks: [] },
    { id: 'pending', title: 'TO DO', icon: '📥', color: '#3b82f6', tasks: [] },
    { id: 'in_progress', title: 'IN PROGRESS', icon: '⚡', color: '#f59e0b', tasks: [] },
    { id: 'done', title: 'DONE', icon: '✅', color: '#22c55e', tasks: [] }
  ];

  showCardModal = false;
  selectedCard: PlannerItem | null = null;
  searchQuery = '';

  private draggedTask: PlannerItem | null = null;

  constructor(
    private plannerService: PlannerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.plannerService.items$.subscribe((items: PlannerItem[]) => {
      this.distributeTasksToColumns(items);
      this.cdr.detectChanges();
    });
  }

  private distributeTasksToColumns(tasks: PlannerItem[]): void {
    this.columns.forEach(column => {
      column.tasks = tasks
        .filter(task => task.status === column.id)
        .filter(task => {
          if (!this.searchQuery) return true;
          const query = this.searchQuery.toLowerCase();
          return task.title.toLowerCase().includes(query) ||
                 task.description?.toLowerCase().includes(query) ||
                 task.tags?.some((tag: string) => tag.toLowerCase().includes(query));
        })
        .sort((a, b) => a.order - b.order);
    });
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.plannerService.items$.subscribe((items: PlannerItem[]) => {
      this.distributeTasksToColumns(items);
    });
  }

  openNewCardModal(): void {
    this.selectedCard = null;
    this.showCardModal = true;
  }

  openCardModal(card: PlannerItem): void {
    this.selectedCard = card;
    this.showCardModal = true;
  }

  closeCardModal(): void {
    this.showCardModal = false;
    this.selectedCard = null;
  }

  async onCardSave(cardData: Partial<PlannerItem>): Promise<void> {
    try {
      if (this.selectedCard) {
        await this.plannerService.updateItem(this.selectedCard.id, cardData);
      } else {
        await this.plannerService.createItem(cardData);
      }
    } catch (error) {
      console.error('Error saving card:', error);
    } finally {
      // Always close modal after save attempt
      this.closeCardModal();
    }
  }

  async deleteCard(cardId: string, event: Event): Promise<void> {
    event.stopPropagation();
    if (confirm('Delete this card?')) {
      try {
        await this.plannerService.deleteItem(cardId);
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  }

  // Drag and Drop
  onDragStart(event: DragEvent, task: PlannerItem): void {
    this.draggedTask = task;
    const element = event.target as HTMLElement;
    element.classList.add('dragging');
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', task.id);
    }
  }

  onDragEnd(event: DragEvent): void {
    const element = event.target as HTMLElement;
    element.classList.remove('dragging');
    this.draggedTask = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  async onDrop(event: DragEvent, newStatus: PlannerItem['status']): Promise<void> {
    event.preventDefault();
    
    if (this.draggedTask && this.draggedTask.status !== newStatus) {
      try {
        await this.plannerService.updateItemStatus(this.draggedTask.id, newStatus);
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  }

  getCardTypeIcon(type?: string): string {
    switch (type) {
      case 'todo': return 'checklist';
      case 'progress': return 'progress_activity';
      case 'note': return 'note';
      default: return 'description';
    }
  }

  getPriorityColor(priority?: string): string {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#71717a';
    }
  }

  isOverdue(task: PlannerItem): boolean {
    if (!task.due_date || task.status === 'done') return false;
    return new Date(task.due_date) < new Date();
  }

  getTodoCompletedCount(card: PlannerItem): number {
    if (!card.todo_items) return 0;
    return card.todo_items.filter((item: any) => item.completed).length;
  }

  getTodoProgress(card: PlannerItem): number {
    if (!card.todo_items || card.todo_items.length === 0) return 0;
    const completed = card.todo_items.filter((item: any) => item.completed).length;
    return Math.round((completed / card.todo_items.length) * 100);
  }
}
