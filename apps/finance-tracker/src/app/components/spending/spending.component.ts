import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { SpendingService } from '../../services/spending.service';
import { CategoryService } from '../../services/category.service';
import { DialogService } from '../../services/dialog.service';
import { ImportJsonModalComponent } from '../modals/import-json-modal/import-json-modal.component';
import { ManageCategoriesModalComponent } from '../modals/manage-categories-modal/manage-categories-modal.component';
import {
  MonthlyStatement,
  StatementTransaction,
  CurrencyFilter,
  CURRENCY_SYMBOLS,
  Category,
  CurrencyCode
} from '../../models/types';
import { cleanConceptName } from '../../utils/concept-mapper';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-spending',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './spending.component.html',
  styleUrls: ['./spending.component.css']
})
export class SpendingComponent implements OnInit {
  Math = Math;
  transactions: StatementTransaction[] = [];
  filteredTransactions: StatementTransaction[] = [];
  categories: Category[] = [];
  
  currencyFilter: CurrencyFilter = 'ALL';
  searchQuery = '';
  
  startDate = '';
  endDate = '';
  
  isDrawerOpen = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 25;
  itemsPerPageOptions = [10, 25, 50, 100];

  // Charts
  barChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration<'bar'>['options'] = this.getBasicChartOptions();
  
  donutChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  donutChartOptions: ChartConfiguration<'doughnut'>['options'] = this.getDonutChartOptions();
  
  lineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  lineChartOptions: ChartConfiguration<'line'>['options'] = this.getBasicChartOptions();

  constructor(
    private spendingService: SpendingService,
    private categoryService: CategoryService,
    private dialogService: DialogService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.categories = await this.categoryService.getAll();
    this.transactions = await this.spendingService.getAllTransactions('ALL'); // Fetch all, filter locally
    
    if (this.transactions.length > 0 && !this.startDate) {
      // Set default date range to the month of the most recent transaction
      const maxDate = this.transactions
        .map(t => this.parseDate(t.fecha))
        .reduce((max, d) => d > max ? d : max, new Date(0));
      
      this.startDate = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
      this.endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
    }
    
    this.applyFilters();
  }

  // parses DD/MM/YYYY to Date object
  parseDate(dateStr: string): Date {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date(0);
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }

  // formats Date object to string like "Feb 2026"
  formatMonthYear(date: Date): string {
    return date.toLocaleString('es-UY', { month: 'short', year: 'numeric' });
  }

  // formats Date object to string like "15 Feb"
  formatDayMonth(date: Date): string {
    return date.toLocaleString('es-UY', { day: 'numeric', month: 'short' });
  }

  get getDateRangeLabel(): string {
    if (this.filteredTransactions.length === 0) return 'Sin datos';
    const dates = this.filteredTransactions.map(t => this.parseDate(t.fecha));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    if (minDate.getMonth() === maxDate.getMonth() && minDate.getFullYear() === maxDate.getFullYear()) {
      return this.formatMonthYear(minDate);
    }
    return `${this.formatMonthYear(minDate)} - ${this.formatMonthYear(maxDate)}`;
  }

  applyFilters() {
    let filtered = [...this.transactions];

    // Currency
    if (this.currencyFilter !== 'ALL') {
      filtered = filtered.filter(t => {
        if (this.currencyFilter === 'UYU') return t.moneda === 'UYU' || t.moneda === 'Pesos';
        if (this.currencyFilter === 'USD') return t.moneda === 'USD' || t.moneda === 'Dólares';
        return true;
      });
    }

    // Dates
    if (this.startDate) {
      const start = new Date(this.startDate);
      filtered = filtered.filter(t => this.parseDate(t.fecha) >= start);
    }
    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => this.parseDate(t.fecha) <= end);
    }

    // Search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.concepto.toLowerCase().includes(query) ||
        cleanConceptName(t.concepto).toLowerCase().includes(query) ||
        (t.categoria || 'otro').toLowerCase().includes(query)
      );
    }

    this.filteredTransactions = filtered;
    this.currentPage = 1;
    this.buildCharts();
  }

  get paginatedTransactions(): StatementTransaction[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
  }

  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  
  onPerPageChange() {
    this.currentPage = 1;
  }

  openDrawer() {
    this.isDrawerOpen = true;
    this.buildCharts(); // Re-render to ensure dimensions apply
  }

  closeDrawer() {
    this.isDrawerOpen = false;
  }

  // --- KPI calculations ---
  
  getTotalIngresos(): number {
    return this.filteredTransactions.reduce((sum, t) => sum + (t.credito || 0), 0);
  }

  getTotalGastos(): number {
    return this.filteredTransactions
      .filter(t => t.categoria?.toLowerCase() !== 'inversión' && t.categoria?.toLowerCase() !== 'inversiones')
      .reduce((sum, t) => sum + (t.debito || 0), 0);
  }

  getTotalInversiones(): number {
    return this.filteredTransactions
      .filter(t => t.categoria?.toLowerCase() === 'inversión' || t.categoria?.toLowerCase() === 'inversiones')
      .reduce((sum, t) => sum + (t.debito || 0) + (t.credito || 0), 0);
  }

  // --- Chart Building ---

  private getBasicChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#9ca3af', font: { family: 'Inter' } } }
      },
      scales: {
        x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.04)' } }
      }
    };
  }

  private getDonutChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#9ca3af', font: { family: 'Inter', size: 11 }, padding: 12 }
        }
      }
    };
  }

  buildCharts() {
    if (this.filteredTransactions.length === 0) return;
    
    // Check if range spans multiple months
    const dates = this.filteredTransactions.map(t => this.parseDate(t.fecha));
    const minDateStr = this.formatMonthYear(new Date(Math.min(...dates.map(d => d.getTime()))));
    const maxDateStr = this.formatMonthYear(new Date(Math.max(...dates.map(d => d.getTime()))));
    const isMultiMonth = minDateStr !== maxDateStr;

    this.buildDonutChart();
    this.buildBarChart(isMultiMonth);
    this.buildLineChart(isMultiMonth);
  }

  private buildDonutChart() {
    // Only count expenses
    const expTx = this.filteredTransactions.filter(t => (t.debito || 0) > 0);
    const grouped: Record<string, number> = {};
    
    expTx.forEach(t => {
      const cat = t.categoria || 'Otro';
      grouped[cat] = (grouped[cat] || 0) + (t.debito || 0);
    });

    const labels = Object.keys(grouped).sort((a, b) => grouped[b] - grouped[a]);
    const series = labels.map(l => grouped[l]);
    const bgColors = labels.map(l => this.getCategoryColor(l));

    this.donutChartData = {
      labels,
      datasets: [{
        data: series,
        backgroundColor: bgColors,
        borderWidth: 0,
        hoverOffset: 4
      }]
    };
  }

  private buildBarChart(multiMonth: boolean) {
    const expTx = this.filteredTransactions.filter(t => (t.debito || 0) > 0);
    
    // Group by Time Bucket -> Category -> Sum
    const timeBuckets: string[] = []; // x axis
    const catMap = new Set<string>();
    
    const aggregated: Record<string, Record<string, number>> = {};

    expTx.forEach(t => {
      const cat = t.categoria || 'Otro';
      const parsed = this.parseDate(t.fecha);
      const bucket = multiMonth ? this.formatMonthYear(parsed) : this.formatDayMonth(parsed);
      
      catMap.add(cat);
      if (!timeBuckets.includes(bucket)) timeBuckets.push(bucket);
      
      if (!aggregated[bucket]) aggregated[bucket] = {};
      aggregated[bucket][cat] = (aggregated[bucket][cat] || 0) + (t.debito || 0);
    });

    timeBuckets.sort((a, b) => {
      // rough string sort works well enough except for mixing years. We should sort structurally.
      return this.parseDate(expTx.find(t => (multiMonth ? this.formatMonthYear(this.parseDate(t.fecha)) : this.formatDayMonth(this.parseDate(t.fecha))) === a)!.fecha).getTime() - 
             this.parseDate(expTx.find(t => (multiMonth ? this.formatMonthYear(this.parseDate(t.fecha)) : this.formatDayMonth(this.parseDate(t.fecha))) === b)!.fecha).getTime();
    });

    const datasets: ChartConfiguration<'bar'>['data']['datasets'] = [];
    
    catMap.forEach(cat => {
      datasets.push({
        label: cat,
        data: timeBuckets.map(b => aggregated[b][cat] || 0),
        backgroundColor: this.getCategoryColor(cat),
      });
    });

    this.barChartData = { labels: timeBuckets, datasets };
    
    this.barChartOptions = {
        ...this.getBasicChartOptions(),
        scales: {
            x: { stacked: true, ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { stacked: true, ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.04)' } }
        }
    }
  }

  private buildLineChart(multiMonth: boolean) {
    const timeBuckets: string[] = [];
    const aggregated: Record<string, { in: number, out: number }> = {};

    this.filteredTransactions.forEach(t => {
      const parsed = this.parseDate(t.fecha);
      const bucket = multiMonth ? this.formatMonthYear(parsed) : this.formatDayMonth(parsed);
      if (!timeBuckets.includes(bucket)) timeBuckets.push(bucket);
      if (!aggregated[bucket]) aggregated[bucket] = { in: 0, out: 0 };
      
      aggregated[bucket].in += (t.credito || 0);
      aggregated[bucket].out += (t.debito || 0);
    });

    timeBuckets.sort((a, b) => {
        return this.parseDate(this.filteredTransactions.find(t => (multiMonth ? this.formatMonthYear(this.parseDate(t.fecha)) : this.formatDayMonth(this.parseDate(t.fecha))) === a)!.fecha).getTime() - 
               this.parseDate(this.filteredTransactions.find(t => (multiMonth ? this.formatMonthYear(this.parseDate(t.fecha)) : this.formatDayMonth(this.parseDate(t.fecha))) === b)!.fecha).getTime();
    });

    this.lineChartData = {
      labels: timeBuckets,
      datasets: [
        {
          label: 'Ingresos',
          data: timeBuckets.map(b => aggregated[b].in),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Gastos',
          data: timeBuckets.map(b => aggregated[b].out),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    };
  }

  // --- Utils ---

  getCleanName(raw: string): string {
    return cleanConceptName(raw);
  }

  getCategoryColor(catName: string): string {
    const cat = this.categories.find(c => c.nombre.toLowerCase() === (catName || '').toLowerCase());
    return cat ? cat.color : '#6b7280';
  }

  formatCurrency(amount: number | null, currency: string): string {
    if (amount === null || amount === undefined) return '-';
    // If we have mixed currencies, we just display the raw sum without currency symbol (or default to UI currency)
    // To keep it simple, we use the selected currency filter, or UYU by default
    const c = currency || 'UYU';
    const symbol = c === 'ALL' ? '$' : (CURRENCY_SYMBOLS[c as CurrencyCode] || c);
    return `${symbol} ${Math.abs(amount).toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // === MODALS & ACTIONS ===

  openImportModal() {
    const dialogRef = this.dialogService.open<boolean>(ImportJsonModalComponent, { size: 'lg' });
    dialogRef.closed.subscribe(result => {
      if (result) {
        this.toastr.success('JSON importado correctamente');
        this.loadData();
      }
    });
  }

  openCategoriesModal() {
    const dialogRef = this.dialogService.open<boolean>(ManageCategoriesModalComponent, { size: 'md' });
    dialogRef.closed.subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  async onCategoryChange(tx: StatementTransaction, newCategory: string) {
    await this.spendingService.updateTransactionCategory(tx.id, newCategory);
    tx.categoria = newCategory;

    const matchCount = this.transactions.filter(t => t.concepto === tx.concepto && t.id !== tx.id).length;
    if (matchCount > 0) {
      const apply = confirm(
        `¿Aplicar "${newCategory}" a todas las ${matchCount + 1} transacciones con concepto "${this.getCleanName(tx.concepto)}"?`
      );
      if (apply) {
        const updated = await this.spendingService.updateCategoryByConcepto(tx.concepto, newCategory);
        this.transactions.forEach(t => {
          if (t.concepto === tx.concepto) t.categoria = newCategory;
        });
        this.toastr.success(`${updated} transacciones actualizadas`);
        this.applyFilters();
      } else {
          this.buildCharts();
      }
    } else {
        this.buildCharts();
    }
  }

  async recategorizeAll() {
    const count = await this.spendingService.recategorizeAll();
    if (count > 0) {
      this.toastr.success(`${count} transacciones re-categorizadas`);
      this.loadData();
    } else {
      this.toastr.info('No hay transacciones para re-categorizar');
    }
  }
}
