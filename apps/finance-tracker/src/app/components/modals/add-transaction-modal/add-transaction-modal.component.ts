import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { TransactionService } from '../../../services/transaction.service';
import { CategoryService } from '../../../services/category.service';
import { CashTransaction, Category } from '../../../models/types';

@Component({
  selector: 'app-add-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sh-modal-header">
      <h2 class="sh-modal-title">{{ isEdit ? 'Editar' : 'Nueva' }} Transacción</h2>
      <button class="sh-modal-close" (click)="close()">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="sh-modal-body">
      <div class="form-grid">
        <div class="form-field">
          <label>Concepto *</label>
          <input type="text" class="sh-input" [(ngModel)]="form.concepto" placeholder="Ej: Almuerzo, Taxi...">
        </div>
        <div class="form-field">
          <label>Monto *</label>
          <input type="number" class="sh-input" [(ngModel)]="form.monto" placeholder="0.00" min="0" step="0.01">
        </div>
        <div class="form-field">
          <label>Tipo</label>
          <div class="type-toggle">
            <button class="type-btn" [class.active-gasto]="form.tipo === 'gasto'" (click)="form.tipo = 'gasto'">
              <span class="material-symbols-outlined">arrow_upward</span> Gasto
            </button>
            <button class="type-btn" [class.active-ingreso]="form.tipo === 'ingreso'" (click)="form.tipo = 'ingreso'">
              <span class="material-symbols-outlined">arrow_downward</span> Ingreso
            </button>
          </div>
        </div>
        <div class="form-field">
          <label>Fecha</label>
          <input type="date" class="sh-input" [(ngModel)]="form.fecha">
        </div>
        <div class="form-field">
          <label>Categoría</label>
          <select class="sh-input sh-select" [(ngModel)]="form.categoria">
            <option value="">Sin categoría</option>
            <option *ngFor="let cat of categories" [value]="cat.nombre">{{ cat.nombre }}</option>
          </select>
        </div>
        <div class="form-field full-width">
          <label>Notas</label>
          <textarea class="sh-input sh-textarea" [(ngModel)]="form.notas" placeholder="Notas adicionales..." rows="2"></textarea>
        </div>
      </div>
    </div>
    <div class="sh-modal-footer">
      <button class="sh-btn sh-btn-secondary" (click)="close()">Cancelar</button>
      <button class="sh-btn sh-btn-primary" [disabled]="!isValid() || saving" (click)="save()">
        {{ saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Agregar') }}
      </button>
    </div>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-field label { font-size: 0.75rem; font-weight: 500; color: #9ca3af; }
    .full-width { grid-column: 1 / -1; }
    .type-toggle { display: flex; gap: 0.5rem; }
    .type-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.375rem; padding: 0.5rem; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; background: transparent; color: #9ca3af; cursor: pointer; font-size: 0.8125rem; transition: all 0.15s ease; }
    .type-btn .material-symbols-outlined { font-size: 1rem; }
    .type-btn:hover { border-color: rgba(255, 255, 255, 0.2); }
    .active-gasto { background: rgba(239, 68, 68, 0.12); color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }
    .active-ingreso { background: rgba(34, 197, 94, 0.12); color: #22c55e; border-color: rgba(34, 197, 94, 0.3); }
  `]
})
export class AddTransactionModalComponent implements OnInit {
  private dialogRef = inject(DialogRef<CashTransaction | null>);
  private data = inject<CashTransaction | undefined>(DIALOG_DATA, { optional: true });
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);

  isEdit = false;
  saving = false;
  categories: Category[] = [];

  form = {
    concepto: '',
    monto: 0,
    tipo: 'gasto' as 'ingreso' | 'gasto',
    fecha: new Date().toISOString().split('T')[0],
    categoria: '',
    notas: ''
  };

  async ngOnInit() {
    this.categories = await this.categoryService.getAll();

    if (this.data) {
      this.isEdit = true;
      this.form = {
        concepto: this.data.concepto,
        monto: this.data.monto,
        tipo: this.data.tipo,
        fecha: this.data.fecha,
        categoria: this.data.categoria || '',
        notas: this.data.notas || ''
      };
    }
  }

  isValid(): boolean {
    return this.form.concepto.trim() !== '' && this.form.monto > 0;
  }

  close() {
    this.dialogRef.close(null);
  }

  async save() {
    if (!this.isValid()) return;
    this.saving = true;
    try {
      if (this.isEdit && this.data) {
        const result = await this.transactionService.update(this.data.id, this.form);
        this.dialogRef.close(result);
      } else {
        const result = await this.transactionService.create(this.form);
        this.dialogRef.close(result);
      }
    } catch {
      this.saving = false;
    }
  }
}
