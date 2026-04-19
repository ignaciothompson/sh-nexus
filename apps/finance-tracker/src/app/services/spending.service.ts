import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import {
  MonthlyStatement,
  StatementTransaction,
  ImportJsonData,
  CurrencyFilter
} from '../models/types';
import { autoCategorizeConcept, normalizeCurrency } from '../utils/concept-mapper';

@Injectable({ providedIn: 'root' })
export class SpendingService {
  constructor(private pbService: PocketbaseService) {}

  async getAllStatements(): Promise<MonthlyStatement[]> {
    try {
      return await this.pbService.client
        .collection('monthly_statements')
        .getFullList<MonthlyStatement>({ sort: '-created' });
    } catch {
      return [];
    }
  }

  async getStatementsByMoneda(moneda: CurrencyFilter): Promise<MonthlyStatement[]> {
    try {
      if (moneda === 'ALL') {
        return await this.getAllStatements();
      }
      const alt = moneda === 'UYU' ? 'Pesos' : moneda === 'USD' ? 'Dólares' : '';
      const filter = alt ? `moneda="${moneda}" || moneda="${alt}"` : `moneda="${moneda}"`;
      return await this.pbService.client
        .collection('monthly_statements')
        .getFullList<MonthlyStatement>({ filter, sort: '-created' });
    } catch {
      return [];
    }
  }

  async getTransactionsByStatement(statementId: string): Promise<StatementTransaction[]> {
    try {
      return await this.pbService.client
        .collection('statement_transactions')
        .getFullList<StatementTransaction>({
          filter: `statement_id="${statementId}"`,
          sort: '-fecha'
        });
    } catch {
      return [];
    }
  }

  async getAllTransactions(currencyFilter?: CurrencyFilter): Promise<StatementTransaction[]> {
    try {
      let filter = '';
      if (currencyFilter && currencyFilter !== 'ALL') {
        const alt = currencyFilter === 'UYU' ? 'Pesos' : currencyFilter === 'USD' ? 'Dólares' : '';
        filter = alt ? `moneda="${currencyFilter}" || moneda="${alt}"` : `moneda="${currencyFilter}"`;
      }
      return await this.pbService.client
        .collection('statement_transactions')
        .getFullList<StatementTransaction>({ filter, sort: '-fecha' });
    } catch {
      return [];
    }
  }

  async importJson(jsonData: ImportJsonData): Promise<MonthlyStatement> {
    const transactions = jsonData.Transacciones || [];
    const normalizedMoneda = normalizeCurrency(jsonData.Moneda);

    let totalDebito = 0;
    let totalCredito = 0;
    let balanceFinal = 0;

    transactions.forEach(t => {
      if (t['Débito']) totalDebito += t['Débito'];
      if (t['Crédito']) totalCredito += t['Crédito'];
      balanceFinal = t.Saldo;
    });

    // Create monthly statement with normalized currency
    const statement = await this.pbService.client
      .collection('monthly_statements')
      .create<MonthlyStatement>({
        mes: jsonData.Mes,
        cuenta: jsonData.Cuenta,
        moneda: normalizedMoneda,
        total_debito: totalDebito,
        total_credito: totalCredito,
        balance_final: balanceFinal,
        transaction_count: transactions.length
      });

    // Create individual transactions with auto-categorization and normalized currency
    for (const t of transactions) {
      await this.pbService.client
        .collection('statement_transactions')
        .create({
          statement_id: statement.id,
          fecha: t.Fecha,
          concepto: t.Concepto,
          debito: t['Débito'],
          credito: t['Crédito'],
          saldo: t.Saldo,
          referencia: t.Referencia,
          moneda: normalizeCurrency(t.Moneda) || normalizedMoneda,
          categoria: autoCategorizeConcept(t.Concepto)
        });
    }

    return statement;
  }

  async deleteStatement(id: string): Promise<void> {
    const transactions = await this.getTransactionsByStatement(id);
    for (const t of transactions) {
      await this.pbService.client.collection('statement_transactions').delete(t.id);
    }
    await this.pbService.client.collection('monthly_statements').delete(id);
  }

  async updateTransactionCategory(id: string, categoria: string): Promise<void> {
    await this.pbService.client
      .collection('statement_transactions')
      .update(id, { categoria });
  }

  /**
   * Update category for ALL transactions that match a given concepto pattern.
   * Returns the number of transactions updated.
   */
  async updateCategoryByConcepto(concepto: string, categoria: string): Promise<number> {
    try {
      const allTx = await this.pbService.client
        .collection('statement_transactions')
        .getFullList<StatementTransaction>({
          filter: `concepto="${concepto}"`
        });

      let count = 0;
      for (const tx of allTx) {
        await this.pbService.client
          .collection('statement_transactions')
          .update(tx.id, { categoria });
        count++;
      }
      return count;
    } catch {
      return 0;
    }
  }

  /**
   * Re-categorize all transactions that still have 'otro' using the auto-categorizer.
   */
  async recategorizeAll(): Promise<number> {
    try {
      const allTx = await this.pbService.client
        .collection('statement_transactions')
        .getFullList<StatementTransaction>({
          filter: `categoria="otro" || categoria=""`
        });

      let count = 0;
      for (const tx of allTx) {
        const newCat = autoCategorizeConcept(tx.concepto);
        if (newCat !== 'Otro') {
          await this.pbService.client
            .collection('statement_transactions')
            .update(tx.id, { categoria: newCat });
          count++;
        }
      }
      return count;
    } catch {
      return 0;
    }
  }
}
