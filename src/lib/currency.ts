export type CurrencyCode = 'USD' | 'ZAR' | 'NGN' | 'KES';

// Hardcoded rates for frontend fallback. In production, these come from the backend.
const RATES: Record<CurrencyCode, number> = {
  USD: 1,
  ZAR: 18.95,
  NGN: 1140.50,
  KES: 132.50,
};

const SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  ZAR: 'R',
  NGN: '₦',
  KES: 'KSh',
};

export function formatCurrency(amountUsd: number, targetCurrency: CurrencyCode = 'USD'): string {
  const rate = RATES[targetCurrency] || 1;
  const symbol = SYMBOLS[targetCurrency] || '$';
  
  const converted = amountUsd * rate;
  
  // Format with commas and 2 decimal places
  return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
