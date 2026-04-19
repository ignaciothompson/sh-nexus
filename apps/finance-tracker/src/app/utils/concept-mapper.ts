/**
 * Mapeo de conceptos bancarios crudos a nombres legibles
 * y auto-categorización basada en el concepto.
 */

// Diccionario: patrón parcial → nombre legible
const CONCEPT_MAP: Record<string, string> = {
  'TIENDA INGLE': 'Tienda Inglesa',
  'DLO*PEDIDOSY': 'PedidosYa',
  'PEDIDOSY': 'PedidosYa',
  'CRED.DIRECTOMEGA S.A.': 'Sueldo (Omega)',
  'CRED.DIRECTOMEGA': 'Sueldo (Omega)',
  'SUPER NATURA': 'Super Natural',
  'CHINA MARKET': 'China Market',
  'MERPAGO': 'MercadoPago',
  'KIABI V': 'Kiabi',
  'KIABI': 'Kiabi',
  'PARAMOUNT+': 'Paramount+',
  'VISA-ILINK': 'Pago Visa',
  'ITAU LIQ PES': 'Liquidación Itaú',
  'ITAU LIQ': 'Liquidación Itaú',
  'TRASPASO A': 'Traspaso',
  'REDIVA': 'Devolución IVA',
};

// Auto-categorización: patrón parcial → nombre de categoría
const CATEGORY_MAP: Record<string, string> = {
  'TIENDA INGLE': 'Comida',
  'SUPER NATURA': 'Comida',
  'CHINA MARKET': 'Otros',
  'DLO*PEDIDOSY': 'Comida',
  'PEDIDOSY': 'Comida',
  'KIABI': 'Ropa',
  'PARAMOUNT+': 'Suscripciones',
  'CRED.DIRECTOMEGA': 'Sueldo',
  'TRASPASO A': 'Traspaso',
  'REDIVA': 'Devolución IVA',
  'VISA-ILINK': 'Pago Crédito',
  'ITAU LIQ': 'Inversión',
  'MERPAGO': 'Tecnología',
};

/**
 * Limpia y traduce un concepto bancario crudo a un nombre legible.
 */
export function cleanConceptName(rawConcept: string): string {
  if (!rawConcept) return rawConcept;

  const upper = rawConcept.toUpperCase().trim();
  const sortedKeys = Object.keys(CONCEPT_MAP).sort((a, b) => b.length - a.length);
  for (const pattern of sortedKeys) {
    if (upper.includes(pattern.toUpperCase())) {
      return CONCEPT_MAP[pattern];
    }
  }

  let cleaned = rawConcept
    .replace(/^COMPRA\s+/i, '')
    .replace(/^DEB\.\s*VARIOS\s+/i, '')
    .trim();

  cleaned = cleaned
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

  return cleaned;
}

/**
 * Determina la categoría más probable para un concepto bancario.
 */
export function autoCategorizeConcept(rawConcept: string): string {
  if (!rawConcept) return 'Otro';

  const upper = rawConcept.toUpperCase().trim();
  const sortedKeys = Object.keys(CATEGORY_MAP).sort((a, b) => b.length - a.length);
  for (const pattern of sortedKeys) {
    if (upper.includes(pattern.toUpperCase())) {
      return CATEGORY_MAP[pattern];
    }
  }

  return 'Otro';
}

/**
 * Normaliza el nombre de moneda del banco al código estándar.
 * "Pesos" → "UYU", "Dólares" → "USD", etc.
 */
export function normalizeCurrency(raw: string): string {
  if (!raw) return raw;
  const lower = raw.toLowerCase().trim();
  if (lower === 'pesos' || lower === 'uyu' || lower === 'peso uruguayo') return 'UYU';
  if (lower === 'dólares' || lower === 'dolares' || lower === 'usd' || lower === 'dolar') return 'USD';
  return raw;
}
