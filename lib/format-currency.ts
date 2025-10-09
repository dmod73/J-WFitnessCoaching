interface FormatCurrencyOptions {
  value: number;
  currency: string;
  locale?: string;
  minimumFractionDigits?: number;
}

export function formatCurrency({ value, currency, locale = 'es-ES', minimumFractionDigits = 2 }: FormatCurrencyOptions) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
  }).format(value);
}