import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { InvestmentService } from '../../services/investment.service';
import { DialogService } from '../../services/dialog.service';
import { AddInvestmentModalComponent } from '../modals/add-investment-modal/add-investment-modal.component';
import {
  Investment,
  CURRENCY_SYMBOLS,
  COMPOUND_LABELS,
  INVESTMENT_TYPE_LABELS,
  CurrencyCode
} from '../../models/types';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './investments.component.html',
  styleUrls: ['./investments.component.css']
})
export class InvestmentsComponent implements OnInit {
  investments: Investment[] = [];
  selectedInvestment: Investment | null = null;
  totalPortfolio = 0;
  totalInvested = 0;
  totalGain = 0;

  // Compound calculator
  calcCapital = 10000;
  calcRate = 5;
  calcFrequency = 'mensual';
  calcYears = 5;
  calcResult = 0;
  calcGain = 0;

  // Projection Chart
  projectionChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  projectionChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9ca3af', font: { family: 'Inter' } } }
    },
    scales: {
      x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.04)' } }
    },
    elements: {
      point: { radius: 2, hoverRadius: 5 },
      line: { tension: 0.3 }
    }
  };

  compoundLabels = COMPOUND_LABELS;
  investmentTypeLabels = INVESTMENT_TYPE_LABELS;

  constructor(
    private investmentService: InvestmentService,
    private dialogService: DialogService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadInvestments();
    this.calculateCompound();
  }

  async loadInvestments() {
    this.investments = await this.investmentService.getAll();
    this.totalPortfolio = this.investmentService.getTotalPortfolioValue(this.investments);
    this.totalInvested = this.investmentService.getTotalInvested(this.investments);
    this.totalGain = this.totalPortfolio - this.totalInvested;

    if (this.investments.length > 0 && !this.selectedInvestment) {
      this.selectInvestment(this.investments[0]);
    }
  }

  selectInvestment(investment: Investment) {
    this.selectedInvestment = investment;
    this.buildProjectionChart(investment);
  }

  buildProjectionChart(investment: Investment) {
    const projectionMonths = 24;
    const data = this.investmentService.getProjectionData(investment, projectionMonths);

    this.projectionChartData = {
      labels: data.map(d => d.month),
      datasets: [{
        label: 'Valor Proyectado',
        data: data.map(d => d.value),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        borderWidth: 2
      }, {
        label: 'Capital Inicial',
        data: data.map(() => investment.capital_inicial),
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        fill: false
      }]
    };
  }

  calculateCompound() {
    this.calcResult = this.investmentService.calculateCompoundInterest(
      this.calcCapital, this.calcRate, this.calcFrequency, this.calcYears
    );
    this.calcGain = this.calcResult - this.calcCapital;
  }

  getCurrentValue(investment: Investment): number {
    return this.investmentService.getCurrentValue(investment);
  }

  getGain(investment: Investment): number {
    return this.getCurrentValue(investment) - investment.capital_inicial;
  }

  getGainPercent(investment: Investment): number {
    if (investment.capital_inicial === 0) return 0;
    return (this.getGain(investment) / investment.capital_inicial) * 100;
  }

  openAddModal(editInvestment?: Investment) {
    const dialogRef = this.dialogService.open<Investment | null, Investment | undefined>(
      AddInvestmentModalComponent,
      { data: editInvestment, size: 'lg' }
    );
    dialogRef.closed.subscribe(result => {
      if (result) {
        this.toastr.success(editInvestment ? 'Inversión actualizada' : 'Inversión creada');
        this.loadInvestments();
      }
    });
  }

  async deleteInvestment(inv: Investment, event: Event) {
    event.stopPropagation();
    if (confirm(`¿Eliminar "${inv.nombre}"?`)) {
      await this.investmentService.delete(inv.id);
      this.toastr.success('Inversión eliminada');
      if (this.selectedInvestment?.id === inv.id) {
        this.selectedInvestment = null;
      }
      this.loadInvestments();
    }
  }

  async toggleActive(inv: Investment, event: Event) {
    event.stopPropagation();
    await this.investmentService.update(inv.id, { activo: !inv.activo });
    this.loadInvestments();
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    const symbol = CURRENCY_SYMBOLS[currency as CurrencyCode] || currency;
    return `${symbol} ${amount.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getFrequencyLabel(f: string): string {
    return COMPOUND_LABELS[f] || f;
  }

  getTypeLabel(t: string): string {
    return INVESTMENT_TYPE_LABELS[t] || t;
  }
}
