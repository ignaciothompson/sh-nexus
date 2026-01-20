import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface IconOption {
  name: string;
  icon: string;
}

interface ColorOption {
  name: string;
  class: string;
  hex: string;
}

export interface NewBookData {
  title: string;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-add-book-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-book-modal.component.html',
  styleUrls: ['./add-book-modal.component.css']
})
export class AddBookModalComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() bookId?: string;
  @Input() initialData?: NewBookData;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<NewBookData>();

  title = '';
  selectedIcon = 'menu_book';
  selectedColor = 'text-purple-400';
  iconSearchQuery = '';
  colorSearchQuery = '';
  isSaving = false; // Prevent double-save

  ngOnInit(): void {
    // Pre-fill form if editing
    if (this.mode === 'edit' && this.initialData) {
      this.title = this.initialData.title;
      this.selectedIcon = this.initialData.icon;
      this.selectedColor = this.initialData.iconColor;
      
      // Find and set icon name in search
      const iconOption = this.iconOptions.find(opt => opt.icon === this.selectedIcon);
      if (iconOption) {
        this.iconSearchQuery = iconOption.name;
      }
      
      // Find and set color name in search
      const colorOption = this.colorOptions.find(opt => opt.class === this.selectedColor);
      if (colorOption) {
        this.colorSearchQuery = colorOption.name;
      }
    }
  }

  get modalTitle(): string {
    return this.mode === 'edit' ? 'Edit Book' : 'Create New Book';
  }

  get saveButtonText(): string {
    return this.mode === 'edit' ? 'Save Changes' : 'Create Book';
  }

  iconOptions: IconOption[] = [
    { name: 'Book', icon: 'menu_book' },
    { name: 'Contacts', icon: 'import_contacts' },
    { name: 'Science', icon: 'science' },
    { name: 'Awesome', icon: 'auto_awesome' },
    { name: 'Code', icon: 'code' },
    { name: 'Terminal', icon: 'terminal' },
    { name: 'School', icon: 'school' },
    { name: 'Work', icon: 'work' },
    { name: 'Folder', icon: 'folder' },
    { name: 'Article', icon: 'article' },
    { name: 'Description', icon: 'description' },
    { name: 'Lightbulb', icon: 'lightbulb' },
    { name: 'Bookmark', icon: 'bookmark' },
    { name: 'Library', icon: 'local_library' },
    { name: 'Rocket', icon: 'rocket_launch' },
    { name: 'Star', icon: 'star' },
    { name: 'Heart', icon: 'favorite' },
    { name: 'Build', icon: 'build' },
    { name: 'Settings', icon: 'settings' },
    { name: 'Database', icon: 'database' }
  ];

  colorOptions: ColorOption[] = [
    { name: 'Purple', class: 'text-purple-400', hex: '#a855f7' },
    { name: 'Blue', class: 'text-blue-400', hex: '#60a5fa' },
    { name: 'Green', class: 'text-green-400', hex: '#4ade80' },
    { name: 'Red', class: 'text-red-400', hex: '#f87171' },
    { name: 'Orange', class: 'text-orange-400', hex: '#fb923c' },
    { name: 'Yellow', class: 'text-yellow-400', hex: '#facc15' },
    { name: 'Pink', class: 'text-pink-400', hex: '#f472b6' },
    { name: 'Indigo', class: 'text-indigo-400', hex: '#818cf8' },
    { name: 'Teal', class: 'text-teal-400', hex: '#2dd4bf' },
    { name: 'Cyan', class: 'text-cyan-400', hex: '#22d3ee' }
  ];

  get filteredIcons(): IconOption[] {
    if (!this.iconSearchQuery.trim()) {
      return this.iconOptions;
    }
    const query = this.iconSearchQuery.toLowerCase();
    return this.iconOptions.filter(option => 
      option.name.toLowerCase().includes(query) || 
      option.icon.toLowerCase().includes(query)
    );
  }

  get filteredColors(): ColorOption[] {
    if (!this.colorSearchQuery.trim()) {
      return this.colorOptions;
    }
    const query = this.colorSearchQuery.toLowerCase();
    return this.colorOptions.filter(option => 
      option.name.toLowerCase().includes(query)
    );
  }

  selectIcon(icon: string, name: string): void {
    this.selectedIcon = icon;
    this.iconSearchQuery = name; // Show selected icon name in search
  }

  selectColor(colorClass: string, name: string): void {
    this.selectedColor = colorClass;
    this.colorSearchQuery = name; // Show selected color name in search
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.title.trim() && !this.isSaving) {
      this.isSaving = true;
      this.save.emit({
        title: this.title.trim(),
        icon: this.selectedIcon,
        iconColor: this.selectedColor
      });
      // Reset isSaving flag after a short delay to allow parent to close modal
      setTimeout(() => {
        this.isSaving = false;
      }, 500);
    }
  }
}
