import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { NoteLabel } from '../../../models/types';

/** Data passed to the LabelManagerModal dialog */
export interface LabelManagerDialogData {
  labels: NoteLabel[];
}

/** Result returned from the LabelManagerModal dialog */
export interface LabelManagerDialogResult {
  action: 'create' | 'delete';
  labelId?: string;
  name?: string;
  color?: string;
}

@Component({
  selector: 'app-label-manager-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './label-manager-modal.component.html',
  styleUrls: ['./label-manager-modal.component.css']
})
export class LabelManagerModalComponent {
  private dialogRef = inject(DialogRef<LabelManagerDialogResult | undefined>);
  private data = inject<LabelManagerDialogData>(DIALOG_DATA);

  labels: NoteLabel[] = [];
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

  constructor() {
    this.labels = this.data.labels;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onCreateLabel(): void {
    if (!this.newLabelName.trim()) return;
    this.dialogRef.close({
      action: 'create',
      name: this.newLabelName.trim(),
      color: this.newLabelColor
    });
  }

  onDeleteLabel(labelId: string): void {
    if (confirm('Delete this label? Notes with this label will not be deleted.')) {
      this.dialogRef.close({
        action: 'delete',
        labelId
      });
    }
  }
}
