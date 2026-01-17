import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { Task } from '../../models/types';

interface Column {
  id: Task['status'];
  title: string;
  icon: string;
  tasks: Task[];
}

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.css'
})
export class TaskBoardComponent implements OnInit {
  columns: Column[] = [
    { id: 'todo', title: 'To Do', icon: '📥', tasks: [] },
    { id: 'in-progress', title: 'In Progress', icon: '🔄', tasks: [] },
    { id: 'done', title: 'Done', icon: '✅', tasks: [] }
  ];

  showModal = false;
  editingTask: Task | null = null;
  formData: Partial<Task> = {
    title: '',
    description: '',
    status: 'todo',
    dueDate: ''
  };

  private draggedTask: Task | null = null;
  private isLoading = false;

  constructor(
    private tasksService: TasksService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  async loadTasks(): Promise<void> {
    if (this.isLoading) return; // Prevent concurrent loads
    this.isLoading = true;
    
    try {
      const tasks = await this.tasksService.getAll();
      this.distributeTasksToColumns([...tasks]); // Create new array
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private distributeTasksToColumns(tasks: Task[]): void {
    this.columns.forEach(column => {
      column.tasks = tasks.filter(task => task.status === column.id);
    });
  }

  openCreateModal(): void {
    this.editingTask = null;
    this.formData = {
      title: '',
      description: '',
      status: 'todo',
      dueDate: ''
    };
    this.showModal = true;
  }

  openEditModal(task: Task): void {
    this.editingTask = task;
    this.formData = {
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingTask = null;
    this.formData = { title: '', description: '', status: 'todo', dueDate: '' };
  }

  async saveTask(): Promise<void> {
    if (!this.formData.title?.trim()) return; // Prevent empty saves
    
    try {
      const taskData = { ...this.formData };
      
      if (this.editingTask) {
        await this.tasksService.update(this.editingTask.id, taskData);
      } else {
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
      // Optimistically remove from UI first
      this.columns.forEach(column => {
        column.tasks = column.tasks.filter(t => t.id !== id);
      });
      this.cdr.detectChanges();
      
      await this.tasksService.delete(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      await this.loadTasks(); // Reload on error
    }
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < new Date();
  }

  // Drag and Drop handlers
  onDragStart(event: DragEvent, task: Task): void {
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

  async onDrop(event: DragEvent, newStatus: Task['status']): Promise<void> {
    event.preventDefault();
    
    if (this.draggedTask && this.draggedTask.status !== newStatus) {
      const task = this.draggedTask;
      const oldStatus = task.status;
      
      try {
        // Optimistically update UI
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
        await this.loadTasks(); // Reload on error
      }
    }
  }
}
