import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/types';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-categories-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sh-modal-header">
      <h2 class="sh-modal-title">Gestionar Categorías</h2>
      <button class="sh-modal-close" (click)="close()">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="sh-modal-body">
      <!-- Add new category -->
      <div class="add-category-row">
        <input type="text" class="sh-input cat-name-input"
               [(ngModel)]="newCategory.nombre"
               placeholder="Nueva categoría..."
               (keyup.enter)="addCategory()">
        <input type="color" class="color-picker"
               [(ngModel)]="newCategory.color"
               title="Color">
        <input type="text" class="sh-input cat-icon-input"
               [(ngModel)]="newCategory.icono"
               placeholder="Ícono"
               title="Nombre del ícono Material Symbols">
        <button class="sh-btn sh-btn-primary btn-add" (click)="addCategory()" [disabled]="!newCategory.nombre.trim()">
          <span class="material-symbols-outlined">add</span>
        </button>
      </div>

      <!-- Categories list -->
      <div class="categories-list">
        <div class="cat-item" *ngFor="let cat of categories; let i = index">
          <div class="cat-left">
            <span class="cat-color-dot" [style.background]="cat.color"></span>
            <span class="material-symbols-outlined cat-icon" [style.color]="cat.color">{{ cat.icono || 'label' }}</span>
          </div>

          <!-- View mode -->
          <ng-container *ngIf="editingId !== cat.id">
            <span class="cat-name">{{ cat.nombre }}</span>
            <div class="cat-actions">
              <button class="cat-action-btn" (click)="startEdit(cat)" title="Editar">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="cat-action-btn cat-delete-btn" (click)="deleteCategory(cat)" title="Eliminar">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </ng-container>

          <!-- Edit mode -->
          <ng-container *ngIf="editingId === cat.id">
            <input type="text" class="sh-input cat-edit-input" [(ngModel)]="editForm.nombre" (keyup.enter)="saveEdit(cat)">
            <input type="color" class="color-picker" [(ngModel)]="editForm.color">
            <input type="text" class="sh-input cat-icon-input" [(ngModel)]="editForm.icono" placeholder="Ícono">
            <div class="cat-actions">
              <button class="cat-action-btn cat-save-btn" (click)="saveEdit(cat)" title="Guardar">
                <span class="material-symbols-outlined">check</span>
              </button>
              <button class="cat-action-btn" (click)="cancelEdit()" title="Cancelar">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </ng-container>
        </div>

        <div class="empty-cats" *ngIf="categories.length === 0">
          <span class="material-symbols-outlined" style="color: #4b5563; font-size: 1.5rem;">category</span>
          <p>No hay categorías. Agrega una arriba.</p>
        </div>
      </div>
    </div>
    <div class="sh-modal-footer">
      <button class="sh-btn sh-btn-secondary" (click)="close()">Cerrar</button>
    </div>
  `,
  styles: [`
    .add-category-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 1rem;
    }
    .cat-name-input {
      flex: 1;
      font-size: 0.8125rem;
    }
    .cat-icon-input {
      width: 80px;
      font-size: 0.75rem;
      text-align: center;
    }
    .color-picker {
      width: 36px;
      height: 36px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.375rem;
      background: transparent;
      cursor: pointer;
      padding: 2px;
    }
    .color-picker::-webkit-color-swatch-wrapper { padding: 1px; }
    .color-picker::-webkit-color-swatch { border-radius: 4px; border: none; }
    .btn-add {
      padding: 0.5rem !important;
      min-width: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-add .material-symbols-outlined {
      font-size: 1.125rem;
    }
    .categories-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      max-height: 360px;
      overflow-y: auto;
    }
    .cat-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      transition: background 0.15s ease;
    }
    .cat-item:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    .cat-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }
    .cat-color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .cat-icon {
      font-size: 1.125rem;
    }
    .cat-name {
      flex: 1;
      font-size: 0.8125rem;
      color: #e5e7eb;
      font-weight: 500;
    }
    .cat-edit-input {
      flex: 1;
      font-size: 0.8125rem;
    }
    .cat-actions {
      display: flex;
      gap: 0.25rem;
      flex-shrink: 0;
    }
    .cat-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border: none;
      border-radius: 0.25rem;
      background: transparent;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .cat-action-btn .material-symbols-outlined { font-size: 1rem; }
    .cat-action-btn:hover { color: #9ca3af; background: rgba(255, 255, 255, 0.05); }
    .cat-delete-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
    .cat-save-btn:hover { color: #22c55e; background: rgba(34, 197, 94, 0.1); }
    .empty-cats {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem;
      text-align: center;
    }
    .empty-cats p {
      font-size: 0.8125rem;
      color: #6b7280;
      margin: 0;
    }
  `]
})
export class ManageCategoriesModalComponent implements OnInit {
  private dialogRef = inject(DialogRef<boolean>);
  private categoryService = inject(CategoryService);
  private toastr = inject(ToastrService);

  categories: Category[] = [];
  editingId: string | null = null;
  changed = false;

  newCategory = {
    nombre: '',
    color: '#60a5fa',
    icono: 'label',
    orden: 0
  };

  editForm = {
    nombre: '',
    color: '',
    icono: ''
  };

  ngOnInit() {
    this.loadCategories();
  }

  async loadCategories() {
    this.categories = await this.categoryService.getAll();
  }

  async addCategory() {
    if (!this.newCategory.nombre.trim()) return;
    try {
      await this.categoryService.create({
        nombre: this.newCategory.nombre.trim(),
        color: this.newCategory.color,
        icono: this.newCategory.icono || 'label',
        orden: this.categories.length
      } as any);
      this.newCategory = { nombre: '', color: '#60a5fa', icono: 'label', orden: 0 };
      this.changed = true;
      await this.loadCategories();
      this.toastr.success('Categoría creada');
    } catch {
      this.toastr.error('Error al crear categoría');
    }
  }

  startEdit(cat: Category) {
    this.editingId = cat.id;
    this.editForm = {
      nombre: cat.nombre,
      color: cat.color,
      icono: cat.icono
    };
  }

  cancelEdit() {
    this.editingId = null;
  }

  async saveEdit(cat: Category) {
    if (!this.editForm.nombre.trim()) return;
    try {
      await this.categoryService.update(cat.id, {
        nombre: this.editForm.nombre.trim(),
        color: this.editForm.color,
        icono: this.editForm.icono
      } as any);
      this.editingId = null;
      this.changed = true;
      await this.loadCategories();
      this.toastr.success('Categoría actualizada');
    } catch {
      this.toastr.error('Error al actualizar');
    }
  }

  async deleteCategory(cat: Category) {
    if (confirm(`¿Eliminar categoría "${cat.nombre}"?`)) {
      try {
        await this.categoryService.delete(cat.id);
        this.changed = true;
        await this.loadCategories();
        this.toastr.success('Categoría eliminada');
      } catch {
        this.toastr.error('Error al eliminar');
      }
    }
  }

  close() {
    this.dialogRef.close(this.changed);
  }
}
