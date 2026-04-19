import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { DialogService } from '../../services/dialog.service';
import { AddTransactionModalComponent } from '../modals/add-transaction-modal/add-transaction-modal.component';
import { CashTransaction, Category } from '../../models/types';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: CashTransaction[] = [];
  filteredTransactions: CashTransaction[] = [];
  categories: Category[] = [];
  searchQuery = '';
  filterType: 'all' | 'ingreso' | 'gasto' = 'all';

  totalIngresos = 0;
  totalGastos = 0;
  balance = 0;

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private dialogService: DialogService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadTransactions();
  }

  async loadTransactions() {
    this.categories = await this.categoryService.getAll();
    this.transactions = await this.transactionService.getAll();
    this.applyFilters();
    this.calculateTotals();
  }

  calculateTotals() {
    this.totalIngresos = this.transactionService.getTotalIngresos(this.transactions);
    this.totalGastos = this.transactionService.getTotalGastos(this.transactions);
    this.balance = this.transactionService.getBalance(this.transactions);
  }

  applyFilters() {
    let result = [...this.transactions];
    if (this.filterType !== 'all') {
      result = result.filter(t => t.tipo === this.filterType);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t =>
        t.concepto.toLowerCase().includes(q) ||
        (t.categoria && t.categoria.toLowerCase().includes(q))
      );
    }
    this.filteredTransactions = result;
  }

  onSearch() {
    this.applyFilters();
  }

  onFilterChange(type: 'all' | 'ingreso' | 'gasto') {
    this.filterType = type;
    this.applyFilters();
  }

  openAddModal(editTransaction?: CashTransaction) {
    const dialogRef = this.dialogService.open<CashTransaction | null, CashTransaction | undefined>(
      AddTransactionModalComponent,
      { data: editTransaction, size: 'md' }
    );
    dialogRef.closed.subscribe(result => {
      if (result) {
        this.toastr.success(editTransaction ? 'Transacción actualizada' : 'Transacción agregada');
        this.loadTransactions();
      }
    });
  }

  async deleteTransaction(tx: CashTransaction) {
    if (confirm(`¿Eliminar "${tx.concepto}"?`)) {
      await this.transactionService.delete(tx.id);
      this.toastr.success('Transacción eliminada');
      this.loadTransactions();
    }
  }

  getCategoryColor(categoryName: string): string {
    return this.categoryService.getCategoryColor(categoryName);
  }

  formatDate(dateStr: string): string {
    return dateStr;
  }
}
