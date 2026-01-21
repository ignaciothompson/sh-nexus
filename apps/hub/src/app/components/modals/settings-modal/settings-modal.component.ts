import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { SectionsService } from '../../../services/sections.service';
import { Section } from '../../../models/types';
import { ToastrService } from 'ngx-toastr';

/** Data passed to the SettingsModal dialog */
export interface SettingsDialogData {
  sections: Section[];
}

/** Result returned when the dialog closes */
export interface SettingsDialogResult {
  sectionsUpdated: boolean;
}

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.css']
})
export class SettingsModalComponent {
  private dialogRef = inject(DialogRef<SettingsDialogResult>);
  private data = inject<SettingsDialogData>(DIALOG_DATA);

  sections: Section[] = [];

  // Tab state
  activeTab: 'sections' | 'appearance' | 'about' = 'sections';

  // Appearance settings (mock for now)
  theme = 'dark';
  accentColor = '#359EFF';

  // Input modal state
  showInputModal = false;
  inputModalTitle = '';
  inputModalValue = '';
  inputModalCallback: ((value: string) => void) | null = null;

  private sectionsUpdated = false;

  constructor(private sectionsService: SectionsService, private toastr: ToastrService) {
    // Initialize from dialog data
    this.sections = [...this.data.sections];
  }

  setTab(tab: 'sections' | 'appearance' | 'about') {
    this.activeTab = tab;
  }

  saveOrder() {
    this.sections.forEach((sec, index) => {
        sec.order = index;
        if (sec.id) this.sectionsService.update(sec.id, sec).subscribe();
    });
    this.sectionsUpdated = true;
  }

  // --- INPUT MODAL ---
  openInputModal(title: string, defaultValue: string, callback: (value: string) => void) {
    this.inputModalTitle = title;
    this.inputModalValue = defaultValue;
    this.inputModalCallback = callback;
    this.showInputModal = true;
  }

  confirmInputModal() {
    if (this.inputModalValue.trim() && this.inputModalCallback) {
      this.inputModalCallback(this.inputModalValue.trim());
    }
    this.closeInputModal();
  }

  closeInputModal() {
    this.showInputModal = false;
    this.inputModalValue = '';
    this.inputModalCallback = null;
  }

  addSection() {
    this.openInputModal('New Section Title', '', (title) => {
      const newSec: Section = { title, order: this.sections.length };
      this.sectionsService.create(newSec).subscribe((created) => {
        this.sections.push(created);
        this.toastr.success('Section added');
        this.sectionsUpdated = true;
      });
    });
  }

  renameSection(section: Section) {
    this.openInputModal('Rename Section', section.title, (newTitle) => {
      if (newTitle !== section.title && section.id) {
        section.title = newTitle;
        this.sectionsService.update(section.id, section).subscribe(() => {
          this.toastr.success('Section renamed');
          this.sectionsUpdated = true;
        });
      }
    });
  }

  deleteSection(section: Section) {
    if (confirm(`Delete section "${section.title}" and all its apps?`)) {
        if (section.id) {
            this.sectionsService.delete(section.id).subscribe(() => {
                this.sections = this.sections.filter(s => s.id !== section.id);
                this.toastr.info('Section deleted');
                this.sectionsUpdated = true;
            });
        }
    }
  }

  moveUp(index: number) {
      if(index > 0) {
          // Swap items manually
          const temp = this.sections[index];
          this.sections[index] = this.sections[index - 1];
          this.sections[index - 1] = temp;
          this.saveOrder();
      }
  }

  moveDown(index: number) {
      if(index < this.sections.length - 1) {
          // Swap items manually
          const temp = this.sections[index];
          this.sections[index] = this.sections[index + 1];
          this.sections[index + 1] = temp;
          this.saveOrder();
      }
  }

  close() {
    this.dialogRef.close({ sectionsUpdated: this.sectionsUpdated });
  }
}
