import { Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlannerItem, PlannerCardType, TodoItem, PlannerProject } from '../../../models/types';
import { PlannerService } from '../../../services/planner.service';

@Component({
  selector: 'app-card-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.css']
})
export class CardModalComponent implements OnInit {
  @Input() card: PlannerItem | null = null;
  @Output() save = new EventEmitter<Partial<PlannerItem>>();
  @Output() close = new EventEmitter<void>();

  formData: Partial<PlannerItem> = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    card_type: 'text',
    tags: [],
    todo_items: [],
    progress_value: 0,
    linked_items: []
  };

  // UI State
  newTag = '';
  newTodoText = '';
  showLinkItemsMenu = false;
  
  // Available items for linking
  availableItems: PlannerItem[] = [];
  projects: PlannerProject[] = [];

  constructor(private plannerService: PlannerService) {}

  ngOnInit(): void {
    if (this.card) {
      this.formData = {
        title: this.card.title,
        description: this.card.description,
        status: this.card.status,
        priority: this.card.priority,
        due_date: this.card.due_date,
        project: this.card.project,
        card_type: this.card.card_type,
        tags: this.card.tags ? [...this.card.tags] : [],
        todo_items: this.card.todo_items ? JSON.parse(JSON.stringify(this.card.todo_items)) : [],
        progress_value: this.card.progress_value || 0,
        linked_items: this.card.linked_items ? [...this.card.linked_items] : []
      };
    }

    // Load projects and items for linking
    this.plannerService.projects$.subscribe(projects => {
      this.projects = projects;
    });

    this.plannerService.items$.subscribe(items => {
      this.availableItems = items.filter(item => item.id !== this.card?.id);
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.link-items-container')) {
      this.showLinkItemsMenu = false;
    }
  }

  // Tags
  addTag(): void {
    if (this.newTag.trim() && !this.formData.tags?.includes(this.newTag.trim())) {
      this.formData.tags = [...(this.formData.tags || []), this.newTag.trim()];
      this.newTag = '';
    }
  }

  removeTag(tag: string): void {
    this.formData.tags = this.formData.tags?.filter(t => t !== tag);
  }

  // Todo Items
  addTodoItem(): void {
    if (this.newTodoText.trim()) {
      const newItem: TodoItem = {
        id: Date.now().toString(),
        text: this.newTodoText.trim(),
        completed: false
      };
      this.formData.todo_items = [...(this.formData.todo_items || []), newItem];
      this.newTodoText = '';
    }
  }

  toggleTodoItem(item: TodoItem): void {
    item.completed = !item.completed;
  }

  removeTodoItem(itemId: string): void {
    this.formData.todo_items = this.formData.todo_items?.filter(item => item.id !== itemId);
  }

  get todoProgress(): number {
    if (!this.formData.todo_items || this.formData.todo_items.length === 0) return 0;
    const completed = this.formData.todo_items.filter(item => item.completed).length;
    return Math.round((completed / this.formData.todo_items.length) * 100);
  }

  // Linked Items
  toggleLinkItemsMenu(): void {
    this.showLinkItemsMenu = !this.showLinkItemsMenu;
  }

  toggleLinkedItem(itemId: string): void {
    const isLinked = this.formData.linked_items?.includes(itemId);
    if (isLinked) {
      this.formData.linked_items = this.formData.linked_items?.filter(id => id !== itemId);
    } else {
      this.formData.linked_items = [...(this.formData.linked_items || []), itemId];
    }
  }

  isItemLinked(itemId: string): boolean {
    return this.formData.linked_items?.includes(itemId) || false;
  }

  getLinkedItemsDisplay(): PlannerItem[] {
    return this.availableItems.filter(item => this.formData.linked_items?.includes(item.id));
  }

  // Save
  onSave(): void {
    if (!this.formData.title?.trim()) return;

    // Prepare date format
    if (this.formData.due_date && !this.formData.due_date.includes('T')) {
      this.formData.due_date = new Date(this.formData.due_date).toISOString();
    }

    this.save.emit(this.formData);
  }

  onClose(): void {
    this.close.emit();
  }

  // Card Type Changes
  onCardTypeChange(): void {
    if (this.formData.card_type === 'todo' && !this.formData.todo_items) {
      this.formData.todo_items = [];
    }
    if (this.formData.card_type === 'progress' && this.formData.progress_value === undefined) {
      this.formData.progress_value = 0;
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

  getStatusColor(status?: string): string {
    switch (status) {
      case 'blocked': return '#ef4444';
      case 'pending': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'done': return '#22c55e';
      default: return '#71717a';
    }
  }
}
