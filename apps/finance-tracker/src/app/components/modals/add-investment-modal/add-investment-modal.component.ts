import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { InvestmentService } from '../../../services/investment.service';
import { Investment, COMPOUND_LABELS, INVESTMENT_TYPE_LABELS } from '../../../models/types';

@Component({
  selector: 'app-add-investment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sh-modal-header">
      <h2 class="sh-modal-title">{{ isEdit ? 'Editar' : 'Nueva' }} Inversión</h2>
      <button class="sh-modal-close" (click)="close()">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="sh-modal-body">
      <div class="form-grid">
        <div class="form-field full-width">
          <label>Nombre de la Inversión *</label>
          <input type="text" class="sh-input" [(ngModel)]="form.nombre" placeholder="Ej: Depósito Banco XXX">
        </div>
        <div class="form-field">
          <label>Tipo</label>
          <select class="sh-input sh-select" [(ngModel)]="form.tipo">
            <option *ngFor="let type of investmentTypes" [value]="type.value">{{ type.label }}</option>
          </select>
        </div>
        <div class="form-field">
          <label>Moneda</label>
          <select class="sh-input sh-select" [(ngModel)]="form.moneda">
            <option value="USD">USD (Dólares)</option>
            <option value="UYU">UYU (Pesos)</option>
          </select>
        </div>
        <div class="form-field">
          <label>Capital Inicial *</label>
          <input type="number" class="sh-input" [(ngModel)]="form.capital_inicial" placeholder="0.00" min="0" step="0.01">
        </div>
        <div class="form-field">
          <label>Tasa Anual (%) *</label>
          <input type="number" class="sh-input" [(ngModel)]="form.tasa_anual" placeholder="5.0" min="0" step="0.1">
        </div>
        <div class="form-field">
          <label>Frecuencia Compuesta</label>
          <select class="sh-input sh-select" [(ngModel)]="form.frecuencia_compuesta">
            <option *ngFor="let freq of frequencies" [value]="freq.value">{{ freq.label }}</option>
          </select>
        </div>
        <div class="form-field">
          <label>Fecha Inicio</label>
          <input type="date" class="sh-input" [(ngModel)]="form.fecha_inicio">
        </div>
        <div class="form-field full-width">
          <label>Fecha Vencimiento (opcional)</label>
          <input type="date" class="sh-input" [(ngModel)]="form.fecha_vencimiento">
        </div>
        <div class="form-field full-width">
          <label>Notas</label>
          <textarea class="sh-input sh-textarea" [(ngModel)]="form.notas" placeholder="Información adicional..." rows="2"></textarea>
        </div>
      </div>

      <!-- Preview -->
      <div class="preview-box" *ngIf="form.capital_inicial > 0 && form.tasa_anual > 0">
        <h4 class="preview-title">Proyección a 1 año</h4>
        <div class="preview-grid">
          <div class="preview-item">
            <span class="preview-label">Valor final</span>
            <span class="preview-value">{{ getProjectedValue() | number:'1.2-2' }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Ganancia</span>
            <span class="preview-value amount-positive">+{{ getProjectedGain() | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="sh-modal-footer">
      <button class="sh-btn sh-btn-secondary" (click)="close()">Cancelar</button>
      <button class="sh-btn sh-btn-primary" [disabled]="!isValid() || saving" (click)="save()">
        {{ saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Inversión') }}
      </button>
    </div>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-field label { font-size: 0.75rem; font-weight: 500; color: #9ca3af; }
    .full-width { grid-column: 1 / -1; }
    .preview-box { margin-top: 1.25rem; padding: 1rem; background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 0.75rem; }
    .preview-title { font-size: 0.8125rem; font-weight: 600; color: #10b981; margin: 0 0 0.625rem 0; }
    .preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .preview-item { display: flex; flex-direction: column; }
    .preview-label { font-size: 0.6875rem; color: #6b7280; }
    .preview-value { font-size: 1.125rem; font-weight: 700; color: white; }
  `]
})
export class AddInvestmentModalComponent implements OnInit {
  private dialogRef = inject(DialogRef<Investment | null>);
  private data = inject<Investment | undefined>(DIALOG_DATA, { optional: true });
  private investmentService = inject(InvestmentService);

  isEdit = false;
  saving = false;

  form = {
    nombre: '',
    tipo: 'deposito_plazo' as string,
    capital_inicial: 0,
    tasa_anual: 5,
    frecuencia_compuesta: 'mensual',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    moneda: 'USD',
    notas: ''
  };

  investmentTypes = Object.entries(INVESTMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
  frequencies = Object.entries(COMPOUND_LABELS).map(([value, label]) => ({ value, label }));

  ngOnInit() {
    if (this.data) {
      this.isEdit = true;
      this.form = {
        nombre: this.data.nombre,
        tipo: this.data.tipo,
        capital_inicial: this.data.capital_inicial,
        tasa_anual: this.data.tasa_anual,
        frecuencia_compuesta: this.data.frecuencia_compuesta,
        fecha_inicio: this.data.fecha_inicio,
        fecha_vencimiento: this.data.fecha_vencimiento || '',
        moneda: this.data.moneda,
        notas: this.data.notas || ''
      };
    }
  }

  isValid(): boolean {
    return this.form.nombre.trim() !== '' && this.form.capital_inicial > 0 && this.form.tasa_anual > 0;
  }

  getProjectedValue(): number {
    return this.investmentService.calculateCompoundInterest(
      this.form.capital_inicial, this.form.tasa_anual, this.form.frecuencia_compuesta, 1
    );
  }

  getProjectedGain(): number {
    return this.getProjectedValue() - this.form.capital_inicial;
  }

  close() {
    this.dialogRef.close(null);
  }

  async save() {
    if (!this.isValid()) return;
    this.saving = true;
    try {
      const payload = this.form as Partial<Investment>;
      if (this.isEdit && this.data) {
        const result = await this.investmentService.update(this.data.id, payload);
        this.dialogRef.close(result);
      } else {
        const result = await this.investmentService.create(payload);
        this.dialogRef.close(result);
      }
    } catch {
      this.saving = false;
    }
  }
}
