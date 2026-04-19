import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { SpendingService } from '../../../services/spending.service';
import { ImportJsonData } from '../../../models/types';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-import-json-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sh-modal-header">
      <h2 class="sh-modal-title">Importar JSON Bancario</h2>
      <button class="sh-modal-close" (click)="close()">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="sh-modal-body">
      <div class="import-info">
        <span class="material-symbols-outlined info-icon">info</span>
        <p>Pega el contenido JSON exportado de tu banco con el formato estándar (Mes, Cuenta, Moneda, Transacciones).</p>
      </div>
      
      <div class="import-methods">
        <!-- File Upload -->
        <div class="upload-zone" (click)="fileInput.click()" (drop)="onDrop($event)" (dragover)="onDragOver($event)">
          <span class="material-symbols-outlined upload-icon">upload_file</span>
          <p>Arrastra un archivo .json o haz clic para seleccionar</p>
          <input #fileInput type="file" accept=".json" (change)="onFileSelect($event)" hidden>
        </div>
        
        <div class="divider-text">o pegar JSON</div>
        
        <!-- JSON Text Area -->
        <textarea class="sh-input sh-textarea json-input"
                  [(ngModel)]="jsonText"
                  placeholder='{"Mes": "Enero 2025", "Cuenta": "...", "Moneda": "UYU", "Transacciones": [...]}'
                  rows="8"
                  (input)="parseJson()">
        </textarea>
      </div>
      
      <!-- Preview -->
      <div class="preview" *ngIf="parsedData">
        <div class="preview-header">
          <span class="material-symbols-outlined" style="color: #22c55e;">check_circle</span>
          <span>JSON válido</span>
        </div>
        <div class="preview-stats">
          <div class="preview-stat">
            <span class="stat-label">Mes</span>
            <span class="stat-value">{{ parsedData.Mes }}</span>
          </div>
          <div class="preview-stat">
            <span class="stat-label">Cuenta</span>
            <span class="stat-value">{{ parsedData.Cuenta }}</span>
          </div>
          <div class="preview-stat">
            <span class="stat-label">Moneda</span>
            <span class="stat-value">{{ parsedData.Moneda }}</span>
          </div>
          <div class="preview-stat">
            <span class="stat-label">Transacciones</span>
            <span class="stat-value">{{ parsedData.Transacciones?.length || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="error-msg" *ngIf="errorMsg">
        <span class="material-symbols-outlined">error</span>
        {{ errorMsg }}
      </div>
    </div>
    <div class="sh-modal-footer">
      <button class="sh-btn sh-btn-secondary" (click)="close()">Cancelar</button>
      <button class="sh-btn sh-btn-primary" [disabled]="!parsedData || importing" (click)="importData()">
        <span class="material-symbols-outlined" *ngIf="!importing" style="font-size: 1.125rem;">cloud_upload</span>
        {{ importing ? 'Importando...' : 'Importar' }}
      </button>
    </div>
  `,
  styles: [`
    .import-info { display: flex; gap: 0.5rem; padding: 0.75rem; background: rgba(96, 165, 250, 0.08); border: 1px solid rgba(96, 165, 250, 0.15); border-radius: 0.5rem; margin-bottom: 1rem; }
    .import-info p { font-size: 0.8125rem; color: #9ca3af; margin: 0; }
    .info-icon { font-size: 1.25rem; color: #60a5fa; flex-shrink: 0; }
    .upload-zone { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem; border: 2px dashed rgba(255, 255, 255, 0.1); border-radius: 0.75rem; cursor: pointer; transition: all 0.2s ease; text-align: center; }
    .upload-zone:hover { border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.05); }
    .upload-icon { font-size: 2rem; color: #6b7280; }
    .upload-zone p { font-size: 0.8125rem; color: #6b7280; margin: 0; }
    .divider-text { text-align: center; color: #4b5563; font-size: 0.75rem; margin: 0.75rem 0; text-transform: uppercase; }
    .json-input { font-family: monospace; font-size: 0.75rem; resize: vertical; }
    .preview { margin-top: 1rem; padding: 0.75rem; background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.15); border-radius: 0.5rem; }
    .preview-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.8125rem; color: #22c55e; font-weight: 600; }
    .preview-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .preview-stat { display: flex; flex-direction: column; }
    .stat-label { font-size: 0.6875rem; color: #6b7280; }
    .stat-value { font-size: 0.8125rem; color: #e5e7eb; font-weight: 500; }
    .error-msg { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; padding: 0.625rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 0.5rem; font-size: 0.8125rem; color: #ef4444; }
  `]
})
export class ImportJsonModalComponent {
  private dialogRef = inject(DialogRef<boolean>);
  private spendingService = inject(SpendingService);
  private toastr = inject(ToastrService);

  jsonText = '';
  parsedData: ImportJsonData | null = null;
  errorMsg = '';
  importing = false;

  close() {
    this.dialogRef.close(false);
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.jsonText = e.target?.result as string;
        this.parseJson();
      };
      reader.readAsText(input.files[0]);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.jsonText = e.target?.result as string;
        this.parseJson();
      };
      reader.readAsText(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  parseJson() {
    this.errorMsg = '';
    this.parsedData = null;
    try {
      const data = JSON.parse(this.jsonText);
      if (!data.Mes || !data.Cuenta || !data.Moneda || !Array.isArray(data.Transacciones)) {
        this.errorMsg = 'El JSON no tiene el formato esperado (Mes, Cuenta, Moneda, Transacciones)';
        return;
      }
      this.parsedData = data;
    } catch {
      if (this.jsonText.trim()) {
        this.errorMsg = 'JSON inválido. Verifica la sintaxis.';
      }
    }
  }

  async importData() {
    if (!this.parsedData) return;
    this.importing = true;
    try {
      await this.spendingService.importJson(this.parsedData);
      this.dialogRef.close(true);
    } catch (error) {
      this.toastr.error('Error al importar');
      this.importing = false;
    }
  }
}
