export interface FiscalYearBounds {
  /** Inclusive start of the fiscal year. */
  start: Date;
  /** Exclusive end of the fiscal year (start of the next fiscal year). */
  end: Date;
}

/** 0-based index of `date`'s month within its fiscal year (0 = the fiscal start month). */
export function getFiscalMonthIndex(date: Date, fiscalStartMonth: number): number {
  const month = date.getMonth() + 1; // 1-12
  return (month - fiscalStartMonth + 12) % 12;
}

export function getFiscalYearBounds(referenceDate: Date, fiscalStartMonth: number): FiscalYearBounds {
  const month = referenceDate.getMonth() + 1;
  const year = referenceDate.getFullYear();
  const startYear = month >= fiscalStartMonth ? year : year - 1;
  const start = new Date(startYear, fiscalStartMonth - 1, 1);
  const end = new Date(startYear + 1, fiscalStartMonth - 1, 1);
  return { start, end };
}

/** Number of fiscal months elapsed so far, counting the current month as elapsed (1-12). */
export function getElapsedFiscalMonths(referenceDate: Date, fiscalStartMonth: number): number {
  return getFiscalMonthIndex(referenceDate, fiscalStartMonth) + 1;
}
