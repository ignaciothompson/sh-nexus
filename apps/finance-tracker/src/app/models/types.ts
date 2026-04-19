// === BASE ===
export interface BaseModel {
  id: string;
  created: string;
  updated: string;
}

// === MONTHLY SPENDING (from JSON import) ===
export interface MonthlyStatement extends BaseModel {
  mes: string;
  cuenta: string;
  moneda: string;
  total_debito: number;
  total_credito: number;
  balance_final: number;
  transaction_count: number;
}

export interface StatementTransaction extends BaseModel {
  statement_id: string;
  fecha: string;
  concepto: string;
  debito: number | null;
  credito: number | null;
  saldo: number;
  referencia: string | null;
  moneda: string;
  categoria: string;
}

// === DAILY CASH TRANSACTIONS ===
export interface CashTransaction extends BaseModel {
  fecha: string;
  concepto: string;
  monto: number;
  tipo: 'ingreso' | 'gasto';
  categoria: string;
  notas: string;
}

// === INVESTMENTS ===
export interface Investment extends BaseModel {
  nombre: string;
  tipo: 'deposito_plazo' | 'acciones' | 'cripto' | 'otro';
  capital_inicial: number;
  tasa_anual: number;
  frecuencia_compuesta: 'diario' | 'mensual' | 'trimestral' | 'semestral' | 'anual';
  fecha_inicio: string;
  fecha_vencimiento: string;
  moneda: string;
  notas: string;
  activo: boolean;
}

// === JSON IMPORT FORMAT ===
export interface ImportJsonData {
  Mes: string;
  Cuenta: string;
  Moneda: string;
  Transacciones: ImportTransaction[];
}

export interface ImportTransaction {
  Fecha: string;
  Concepto: string;
  'Débito': number | null;
  'Crédito': number | null;
  Saldo: number;
  Referencia: string | null;
  Moneda: string;
}

// === CATEGORIES (Dynamic from PocketBase) ===
export interface Category extends BaseModel {
  nombre: string;
  color: string;
  icono: string;
  orden: number;
}

// === CURRENCY ===
export type CurrencyCode = 'UYU' | 'USD';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  UYU: '$U',
  USD: 'US$'
};

export type CurrencyFilter = 'UYU' | 'USD' | 'ALL';

// === COMPOUND FREQUENCY ===
export const COMPOUND_LABELS: Record<string, string> = {
  diario: 'Diario',
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual'
};

export const COMPOUND_PERIODS: Record<string, number> = {
  diario: 365,
  mensual: 12,
  trimestral: 4,
  semestral: 2,
  anual: 1
};

// === INVESTMENT TYPES ===
export const INVESTMENT_TYPE_LABELS: Record<string, string> = {
  deposito_plazo: 'Depósito a Plazo',
  acciones: 'Acciones',
  cripto: 'Criptomonedas',
  otro: 'Otro'
};
