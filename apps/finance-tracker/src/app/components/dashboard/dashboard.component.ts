import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { SpendingService } from '../../services/spending.service';
import { InvestmentService } from '../../services/investment.service';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import {
  MonthlyStatement,
  StatementTransaction,
  Investment,
  CashTransaction,
  CURRENCY_SYMBOLS,
  CurrencyCode
} from '../../models/types';
import { cleanConceptName } from '../../utils/concept-mapper';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  statements: MonthlyStatement[] = [];
  recentTransactions: StatementTransaction[] = [];
  investments: Investment[] = [];
  cashTransactions: CashTransaction[] = [];

  totalSpendingUYU = 0;
  totalSpendingUSD = 0;
  totalIncomeUYU = 0;
  totalIncomeUSD = 0;
  portfolioValue = 0;
  totalInvested = 0;
  cashBalance = 0;

  // Chart
  spendingChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };
  spendingChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { family: 'Inter' } }
      }
    },
    scales: {
      x: {
        ticks: { color: '#6b7280', font: { family: 'Inter', size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' }
      },
      y: {
        ticks: { color: '#6b7280', font: { family: 'Inter', size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' }
      }
    }
  };

  constructor(
    private spendingService: SpendingService,
    private investmentService: InvestmentService,
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      await this.categoryService.getAll(); // preload cache
      this.statements = await this.spendingService.getAllStatements();
      this.investments = await this.investmentService.getAll();
      this.cashTransactions = await this.transactionService.getAll();
      this.recentTransactions = await this.spendingService.getAllTransactions();

      this.calculateKPIs();
      this.buildChart();
    } catch {
      // Data will show as empty/zero
    }
  }

  calculateKPIs() {
    const isUYU = (s: MonthlyStatement) => s.moneda === 'UYU' || s.moneda === 'Pesos';
    const isUSD = (s: MonthlyStatement) => s.moneda === 'USD' || s.moneda === 'Dólares';

    // Spending by currency
    this.totalSpendingUYU = this.statements
      .filter(isUYU)
      .reduce((sum, s) => sum + s.total_debito, 0);
    this.totalSpendingUSD = this.statements
      .filter(isUSD)
      .reduce((sum, s) => sum + s.total_debito, 0);

    // Income by currency
    this.totalIncomeUYU = this.statements
      .filter(isUYU)
      .reduce((sum, s) => sum + s.total_credito, 0);
    this.totalIncomeUSD = this.statements
      .filter(isUSD)
      .reduce((sum, s) => sum + s.total_credito, 0);

    // Investments
    this.portfolioValue = this.investmentService.getTotalPortfolioValue(this.investments);
    this.totalInvested = this.investmentService.getTotalInvested(this.investments);

    // Cash
    this.cashBalance = this.transactionService.getBalance(this.cashTransactions);
  }

  buildChart() {
    const last6 = this.statements.slice(0, 6).reverse();
    const uyuStatements = last6.filter(s => s.moneda === 'UYU' || s.moneda === 'Pesos');
    const usdStatements = last6.filter(s => s.moneda === 'USD' || s.moneda === 'Dólares');

    const allMonths = [...new Set(last6.map(s => s.mes))];

    this.spendingChartData = {
      labels: allMonths,
      datasets: [
        {
          label: 'Gastos UYU',
          data: allMonths.map(m => {
            const stmt = uyuStatements.find(s => s.mes === m);
            return stmt ? stmt.total_debito : 0;
          }),
          backgroundColor: 'rgba(96, 165, 250, 0.6)',
          borderColor: '#60a5fa',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'Gastos USD',
          data: allMonths.map(m => {
            const stmt = usdStatements.find(s => s.mes === m);
            return stmt ? stmt.total_debito : 0;
          }),
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    };
  }

  // === CLEAN CONCEPT NAME ===
  getCleanName(concepto: string): string {
    return cleanConceptName(concepto);
  }

  // === CATEGORY HELPERS ===
  getCategoryColor(categoryName: string): string {
    return this.categoryService.getCategoryColor(categoryName);
  }

  formatCurrency(amount: number, currency: CurrencyCode = 'UYU'): string {
    const symbol = CURRENCY_SYMBOLS[currency];
    return `${symbol} ${amount.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getInvestmentGain(): number {
    return this.portfolioValue - this.totalInvested;
  }

  getRecentTransactionsSlice(): StatementTransaction[] {
    return this.recentTransactions.slice(0, 8);
  }
}
