import { describe, it, expect } from 'vitest';
import {
  computeMonthSpend,
  computeThisMonthRemaining,
  computeFiscalYtdRemaining,
  computeFullYearRemaining,
} from '../spending/categoryMetrics';
import type { Purchase, Subscription } from '../../types/models';

const CATEGORY = 'groceries';

function purchase(date: string, amount: number, categoryId = CATEGORY): Purchase {
  return { id: date + amount, date, amount, categoryId, location: 'test', createdAt: 0 };
}

describe('worked example from the product spec: budget $1000/mo, month1 spend $200, month2 spend $100', () => {
  const monthlyBudget = 1000;

  it('month 1: this-month remaining 800, fiscal YTD remaining 800', () => {
    const purchases = [purchase('2025-01-10', 200)];
    const monthSpend = computeMonthSpend(purchases, [], CATEGORY, new Date(2025, 0, 1), new Date(2025, 1, 1));
    expect(monthSpend).toBe(200);
    expect(computeThisMonthRemaining(monthlyBudget, monthSpend)).toBe(800);
    expect(computeFiscalYtdRemaining(monthlyBudget, 1, 200)).toBe(800);
  });

  it('month 2: this-month remaining 900, fiscal YTD remaining 1700 (== 800 + 900)', () => {
    const purchases = [purchase('2025-01-10', 200), purchase('2025-02-05', 100)];
    const monthSpend = computeMonthSpend(purchases, [], CATEGORY, new Date(2025, 1, 1), new Date(2025, 2, 1));
    expect(monthSpend).toBe(100);
    expect(computeThisMonthRemaining(monthlyBudget, monthSpend)).toBe(900);

    const ytdSpend = 200 + 100;
    const fiscalYtdRemaining = computeFiscalYtdRemaining(monthlyBudget, 2, ytdSpend);
    expect(fiscalYtdRemaining).toBe(1700);
    // matches sum of each month's individual remaining
    expect(fiscalYtdRemaining).toBe(800 + 900);
  });

  it('full-year remaining is a distinct, separate metric using all 12 months', () => {
    const ytdSpend = 300;
    expect(computeFullYearRemaining(monthlyBudget, ytdSpend)).toBe(12 * 1000 - 300);
    expect(computeFullYearRemaining(monthlyBudget, ytdSpend)).toBe(11700);
  });
});

describe('computeMonthSpend', () => {
  it('folds in active subscriptions billed within the month', () => {
    const subs: Subscription[] = [
      { id: 's1', name: 'Netflix', amount: 15, billingDate: 5, categoryId: CATEGORY, active: true, createdAt: 0, updatedAt: 0 },
      { id: 's2', name: 'Inactive', amount: 999, billingDate: 5, categoryId: CATEGORY, active: false, createdAt: 0, updatedAt: 0 },
    ];
    const spend = computeMonthSpend([], subs, CATEGORY, new Date(2025, 0, 1), new Date(2025, 1, 1));
    expect(spend).toBe(15);
  });

  it('ignores purchases/subscriptions from other categories', () => {
    const purchases = [purchase('2025-01-10', 200, 'other-category')];
    const spend = computeMonthSpend(purchases, [], CATEGORY, new Date(2025, 0, 1), new Date(2025, 1, 1));
    expect(spend).toBe(0);
  });
});
