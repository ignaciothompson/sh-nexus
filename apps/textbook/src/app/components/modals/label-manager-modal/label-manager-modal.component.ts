import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteLabel } from '../../../models/types';

@Component({
  selector: 'app-label-manager-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './label-manager-modal.component.html',
  styleUrls: ['./label-manager-modal.component.css']
})
export class LabelManagerModalComponent {
  @Input() labels: NoteLabel[] = [];
  @Output() createLabel = new EventEmitter<{ name: string; color: string }>();
  @Output() deleteLabel = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  newLabelName = '';
  newLabelColor = '#9c33ff';

  labelColors = [
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
    this.close.emit();
  }

  onCreateLabel(): void {
    if (!this.newLabelName.trim()) return;
    this.createLabel.emit({
      name: this.newLabelName.trim(),
      color: this.newLabelColor
    });
    this.newLabelName = '';
    this.newLabelColor = '#9c33ff';
  }

  onDeleteLabel(labelId: string): void {
    if (confirm('Delete this label? Notes with this label will not be deleted.')) {
      this.deleteLabel.emit(labelId);
    }
  }
}
