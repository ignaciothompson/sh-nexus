import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { CashTransaction } from '../models/types';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(private pbService: PocketbaseService) {}

  async getAll(): Promise<CashTransaction[]> {
    try {
      return await this.pbService.client
        .collection('cash_transactions')
        .getFullList<CashTransaction>({ sort: '-fecha' });
    } catch {
      return [];
    }
  }

  async getByDateRange(startDate: string, endDate: string): Promise<CashTransaction[]> {
    try {
      return await this.pbService.client
        .collection('cash_transactions')
        .getFullList<CashTransaction>({
          filter: `fecha >= "${startDate}" && fecha <= "${endDate}"`,
          sort: '-fecha'
        });
    } catch {
      return [];
    }
  }

  async create(transaction: Partial<CashTransaction>): Promise<CashTransaction> {
    return await this.pbService.client
      .collection('cash_transactions')
      .create<CashTransaction>(transaction);
  }

  async update(id: string, data: Partial<CashTransaction>): Promise<CashTransaction> {
    return await this.pbService.client
      .collection('cash_transactions')
      .update<CashTransaction>(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.pbService.client
      .collection('cash_transactions')
      .delete(id);
  }

  getTotalIngresos(transactions: CashTransaction[]): number {
    return transactions
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);
  }

  getTotalGastos(transactions: CashTransaction[]): number {
    return transactions
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.monto, 0);
  }

  getBalance(transactions: CashTransaction[]): number {
    return this.getTotalIngresos(transactions) - this.getTotalGastos(transactions);
  }
}
