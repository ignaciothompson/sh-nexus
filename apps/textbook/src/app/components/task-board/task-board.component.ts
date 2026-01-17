import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../../services/tasks.service';
import { PlannerItem } from '../../models/types';

interface Column {
  id: PlannerItem['status'];
  title: string;
  icon: string;
  tasks: PlannerItem[];
}

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.css'
})
export class TaskBoardComponent implements OnInit {
  columns: Column[] = [
    { id: 'todo', title: 'To Do', icon: '📥', tasks: [] },
    { id: 'in_progress', title: 'In Progress', icon: '🔄', tasks: [] },
    { id: 'done', title: 'Done', icon: '✅', tasks: [] }
  ];

  showModal = false;
  editingTask: PlannerItem | null = null;
  formData: Partial<PlannerItem> = {
    title: '',
    status: 'todo',
    due_date: '',
    order: 0,
    description: ''
  };

  private draggedTask: PlannerItem | null = null;
  private isLoading = false;

  constructor(
    private tasksService: TasksService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  async loadTasks(): Promise<void> {
    if (this.isLoading) return; 
    this.isLoading = true;
    
    try {
      const tasks = await this.tasksService.getAll();
      this.distributeTasksToColumns([...tasks]);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private distributeTasksToColumns(tasks: PlannerItem[]): void {
    this.columns.forEach(column => {
      column.tasks = tasks.filter(task => task.status === column.id);
    });
  }

  openCreateModal(): void {
    this.editingTask = null;
    this.formData = {
      title: '',
      status: 'todo',
      due_date: '',
      order: 0,
      description: ''
    };
    this.showModal = true;
  }

  openEditModal(task: PlannerItem): void {
    this.editingTask = task;
    this.formData = {
      title: task.title,
      status: task.status,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      order: task.order,
      description: task.description || ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingTask = null;
    this.formData = { title: '', status: 'todo', due_date: '', order: 0, description: '' };
  }

  async saveTask(): Promise<void> {
    if (!this.formData.title?.trim()) return;
    
    try {
      const taskData = { ...this.formData };
      
      // Ensure date is ISO string if present
      if (taskData.due_date && !taskData.due_date.includes('T')) {
          taskData.due_date = new Date(taskData.due_date).toISOString();
      }

      if (this.editingTask) {
        await this.tasksService.update(this.editingTask.id, taskData);
      } else {
        // Assign default order if new (e.g., at the end)
        taskData.order = this.columns.find(c => c.id === taskData.status)?.tasks.length || 0;
        await this.tasksService.create(taskData);
      }
      
      this.closeModal();
      await this.loadTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  }

  async deleteTask(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      this.columns.forEach(column => {
        column.tasks = column.tasks.filter(t => t.id !== id);
      });
      this.cdr.detectChanges();
      
      await this.tasksService.delete(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      await this.loadTasks(); 
    }
  }

  isOverdue(task: PlannerItem): boolean {
    if (!task.due_date || task.status === 'done') return false;
    return new Date(task.due_date) < new Date();
  }

  // Drag and Drop handlers
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
      const task = this.draggedTask;
      const oldStatus = task.status;
      
      try {
        const oldColumn = this.columns.find(c => c.id === oldStatus);
        const newColumn = this.columns.find(c => c.id === newStatus);
        
        if (oldColumn && newColumn) {
          oldColumn.tasks = oldColumn.tasks.filter(t => t.id !== task.id);
          task.status = newStatus;
          newColumn.tasks = [task, ...newColumn.tasks];
          this.cdr.detectChanges();
        }
        
        await this.tasksService.updateStatus(task.id, newStatus);
      } catch (error) {
        console.error('Error updating task status:', error);
        await this.loadTasks(); 
      }
    }
  }
}
