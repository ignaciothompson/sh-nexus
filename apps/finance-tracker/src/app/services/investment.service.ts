import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { Investment, COMPOUND_PERIODS } from '../models/types';

@Injectable({ providedIn: 'root' })
export class InvestmentService {
  constructor(private pbService: PocketbaseService) {}

  async getAll(): Promise<Investment[]> {
    try {
      return await this.pbService.client
        .collection('investments')
        .getFullList<Investment>({ sort: '-created' });
    } catch {
      return [];
    }
  }

  async getActive(): Promise<Investment[]> {
    try {
      return await this.pbService.client
        .collection('investments')
        .getFullList<Investment>({
          filter: 'activo=true',
          sort: '-created'
        });
    } catch {
      return [];
    }
  }

  async create(investment: Partial<Investment>): Promise<Investment> {
    return await this.pbService.client
      .collection('investments')
      .create<Investment>({ ...investment, activo: true });
  }

  async update(id: string, data: Partial<Investment>): Promise<Investment> {
    return await this.pbService.client
      .collection('investments')
      .update<Investment>(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.pbService.client
      .collection('investments')
      .delete(id);
  }

  /**
   * Calculate compound interest
   * A = P(1 + r/n)^(nt)
   * P = principal, r = annual rate (decimal), n = compounds per year, t = time in years
   */
  calculateCompoundInterest(
    principal: number,
    annualRate: number,
    frequency: string,
    years: number
  ): number {
    const n = COMPOUND_PERIODS[frequency] || 12;
    const r = annualRate / 100;
    return principal * Math.pow(1 + r / n, n * years);
  }

  /**
   * Get monthly projection data for chart
   */
  getProjectionData(investment: Investment, months: number = 12): { month: string; value: number }[] {
    const data: { month: string; value: number }[] = [];
    const n = COMPOUND_PERIODS[investment.frecuencia_compuesta] || 12;
    const r = investment.tasa_anual / 100;

    for (let m = 0; m <= months; m++) {
      const t = m / 12;
      const value = investment.capital_inicial * Math.pow(1 + r / n, n * t);
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const startDate = new Date(investment.fecha_inicio);
      const currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + m);
      const label = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      data.push({ month: label, value: Math.round(value * 100) / 100 });
    }

    return data;
  }

  /**
   * Get current value of an investment
   */
  getCurrentValue(investment: Investment): number {
    const startDate = new Date(investment.fecha_inicio);
    const now = new Date();
    const years = (now.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (years < 0) return investment.capital_inicial;
    return this.calculateCompoundInterest(
      investment.capital_inicial,
      investment.tasa_anual,
      investment.frecuencia_compuesta,
      years
    );
  }

  /**
   * Get total portfolio value
   */
  getTotalPortfolioValue(investments: Investment[]): number {
    return investments
      .filter(i => i.activo)
      .reduce((sum, inv) => sum + this.getCurrentValue(inv), 0);
  }

  /**
   * Get total invested capital
   */
  getTotalInvested(investments: Investment[]): number {
    return investments
      .filter(i => i.activo)
      .reduce((sum, inv) => sum + inv.capital_inicial, 0);
  }
}
