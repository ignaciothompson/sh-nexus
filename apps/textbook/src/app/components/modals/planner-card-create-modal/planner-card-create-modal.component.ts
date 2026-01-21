import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';

export interface NewProjectData {
  name: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-planner-card-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planner-card-create-modal.component.html',
  styleUrls: ['./planner-card-create-modal.component.css']
})
export class PlannerCardCreateModalComponent {
  private dialogRef = inject(DialogRef<NewProjectData | undefined>);

  newProject: NewProjectData = {
    name: '',
    icon: 'folder',
    color: '#9c33ff'
  };

  icons = [
    { name: 'Folder', value: 'folder' },
    { name: 'Work', value: 'work' },
    { name: 'Home', value: 'home' },
    { name: 'Shopping', value: 'shopping_cart' },
    { name: 'Fitness', value: 'fitness_center' },
    { name: 'Code', value: 'code' },
    { name: 'Design', value: 'palette' },
    { name: 'Star', value: 'star' }
  ];

  colors = [
    { name: 'Purple', value: '#9c33ff' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' }
  ];

  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.newProject.name.trim()) return;
    this.dialogRef.close({ ...this.newProject });
  }
}
