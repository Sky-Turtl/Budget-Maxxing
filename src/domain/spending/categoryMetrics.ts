import type { Purchase, Subscription } from '../../types/models';

/**
 * Sums purchases + lazily-resolved active subscriptions billed within [monthStart, monthEnd)
 * for a given category. Subscriptions are never written as synthetic purchase docs — their
 * monthly cost is folded in here at read time based on `billingDate` falling within the range.
 */
export function computeMonthSpend(
  purchases: Purchase[],
  subscriptions: Subscription[],
  categoryId: string,
  monthStart: Date,
  monthEnd: Date
): number {
  const purchaseTotal = purchases
    .filter((p) => p.categoryId === categoryId && !p.cancelled)
    .filter((p) => {
      const d = new Date(p.date);
      return d >= monthStart && d < monthEnd;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const subscriptionTotal = subscriptions
    .filter((s) => s.categoryId === categoryId && s.active)
    .filter((s) => {
      const billingDay = Math.min(s.billingDate, daysInMonth(monthStart));
      const billedDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), billingDay);
      return billedDate >= monthStart && billedDate < monthEnd;
    })
    .reduce((sum, s) => sum + s.amount, 0);

  return purchaseTotal + subscriptionTotal;
}

function daysInMonth(monthStart: Date): number {
  return new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
}

/** Sums each elapsed fiscal month's spend (purchases + subscriptions) for a category, from fyStart through now. */
export function computeFiscalYtdSpend(
  purchases: Purchase[],
  subscriptions: Subscription[],
  categoryId: string,
  fyStart: Date,
  fyEnd: Date,
  now: Date
): number {
  let ytdSpend = 0;
  for (let cursor = new Date(fyStart); cursor < fyEnd && cursor <= now; cursor.setMonth(cursor.getMonth() + 1)) {
    const mStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const mEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    ytdSpend += computeMonthSpend(purchases, subscriptions, categoryId, mStart, mEnd);
  }
  return ytdSpend;
}

/** Remaining budget for the current month only. */
export function computeThisMonthRemaining(monthlyBudget: number, monthSpend: number): number {
  return monthlyBudget - monthSpend;
}

/**
 * Fiscal-year-to-date remaining = (elapsed fiscal months incl. current * monthlyBudget) - YTD spend.
 * Equivalent to summing each elapsed month's individual remaining amount.
 */
export function computeFiscalYtdRemaining(
  monthlyBudget: number,
  elapsedFiscalMonths: number,
  ytdSpend: number
): number {
  return elapsedFiscalMonths * monthlyBudget - ytdSpend;
}

/** Remaining against the full 12-month annual budget, regardless of months elapsed. */
export function computeFullYearRemaining(monthlyBudget: number, ytdSpend: number): number {
  return 12 * monthlyBudget - ytdSpend;
}
