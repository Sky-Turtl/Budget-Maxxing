import { useState } from 'react';
import { usePaycheckConfig, usePostTaxAllocations } from '../hooks/usePaycheckConfig';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { usePurchases } from '../hooks/usePurchases';
import { computePaycheck } from '../domain/paycheck/computePaycheck';
import {
  computeMonthSpend,
  computeFiscalYtdSpend,
  computeThisMonthRemaining,
  computeFiscalYtdRemaining,
  computeFullYearRemaining,
} from '../domain/spending/categoryMetrics';
import { getElapsedFiscalMonths, getFiscalYearBounds } from '../domain/spending/fiscalYear';
import { Money } from '../components/Money';
import { PageHeader } from '../components/layout/PageHeader';

export function SummaryPage() {
  const [includeInvestments, setIncludeInvestments] = useState(false);
  const [excludedCategoryIds, setExcludedCategoryIds] = useState<Set<string>>(new Set());
  const { config, loading: configLoading } = usePaycheckConfig();
  const { allocations, loading: allocationsLoading } = usePostTaxAllocations();
  const { profile, loading: profileLoading } = useUserProfile();
  const { categories, loading: categoriesLoading } = useBudgetCategories();
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions();
  const { purchases, loading: purchasesLoading } = usePurchases();

  const loading =
    configLoading ||
    allocationsLoading ||
    profileLoading ||
    categoriesLoading ||
    subscriptionsLoading ||
    purchasesLoading;

  if (loading || !profile) return <div className="page-loading">Loading…</div>;
  if (!config) return <p>Fill out the Paycheck Calculator first.</p>;

  const paycheck = computePaycheck({ ...config, stateCode: profile.state });
  // Post-tax allocations are entered as annual $ amounts.
  const allocationsAnnualTotal = allocations
    ? allocations.otherPersonalContributions +
      allocations.setAsideSavings +
      allocations.rothIRA +
      allocations.gifts +
      allocations.debtPayments
    : 0;

  const annualTakeHome = paycheck.netAnnual - allocationsAnnualTotal;
  const monthlyTakeHome = annualTakeHome / 12;
  const annualInvested = paycheck.total401k + (allocations?.rothIRA ?? 0);
  const monthlyInvested = annualInvested / 12;

  const monthlySubscriptionsTotal = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + s.amount, 0);
  const annualSubscriptionsTotal = monthlySubscriptionsTotal * 12;

  const totalIncludingInvestments = annualTakeHome + annualInvested - annualSubscriptionsTotal;

  const activeCategories = categories.filter((c) => !c.archived);
  // Subscriptions tied to a category draw down that category's budget already; only
  // uncategorized subscriptions need to be subtracted separately here.
  const monthlyUncategorizedSubscriptions = subscriptions
    .filter((s) => s.active && !s.categoryId)
    .reduce((sum, s) => sum + s.amount, 0);
  const monthlyCategoryBudgetTotal = activeCategories.reduce((sum, c) => sum + c.monthlyBudget, 0);
  const monthlyAllocatedSpending = monthlyCategoryBudgetTotal + monthlyUncategorizedSubscriptions;
  const annualAllocatedSpending = monthlyAllocatedSpending * 12;

  const projectedMonthlyTakeHome = monthlyTakeHome - monthlyAllocatedSpending;
  const projectedAnnualTakeHome = annualTakeHome - annualAllocatedSpending;
  const projectedMonthlyTakeHomeWithInvestments = projectedMonthlyTakeHome + monthlyInvested;
  const projectedAnnualTakeHomeWithInvestments = projectedAnnualTakeHome + annualInvested;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const fiscalStartMonth = profile.fiscalYearStartMonth;
  const { start: fyStart, end: fyEnd } = getFiscalYearBounds(now, fiscalStartMonth);
  const elapsedMonths = getElapsedFiscalMonths(now, fiscalStartMonth);

  const categoryRows = activeCategories.map((c) => {
    const thisMonthSpend = computeMonthSpend(purchases, subscriptions, c.id, monthStart, monthEnd);
    const ytdSpend = computeFiscalYtdSpend(purchases, subscriptions, c.id, fyStart, fyEnd, now);
    return {
      id: c.id,
      name: c.name,
      thisMonthSpend,
      monthlyRemaining: computeThisMonthRemaining(c.monthlyBudget, thisMonthSpend),
      fiscalYtdRemaining: computeFiscalYtdRemaining(c.monthlyBudget, elapsedMonths, ytdSpend),
      yearlyRemaining: computeFullYearRemaining(c.monthlyBudget, ytdSpend),
    };
  });
  const totalSpentThisMonth = categoryRows.reduce((sum, row) => sum + row.thisMonthSpend, 0);
  const selectedTotalSpentThisMonth = categoryRows
    .filter((row) => !excludedCategoryIds.has(row.id))
    .reduce((sum, row) => sum + row.thisMonthSpend, 0);

  function toggleCategoryIncluded(categoryId: string) {
    setExcludedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  return (
    <div className="summary-page">
      <PageHeader
        title="Summary"
        description="The full picture — what you take home, what you're investing, and how this month's spending compares to budget across every category."
      />

      <section className="results stat-grid">
        <div className="stat-block">
          <span className="stat-label">Monthly take-home</span>
          <Money className="stat-figure" value={monthlyTakeHome} />
        </div>
        <div className="stat-block">
          <span className="stat-label">Annual take-home</span>
          <Money className="stat-figure" value={annualTakeHome} />
        </div>
        <div className="stat-block">
          <span className="stat-label">Monthly invested</span>
          <Money className="stat-figure" value={monthlyInvested} />
        </div>
        <div className="stat-block">
          <span className="stat-label">Annual invested</span>
          <Money className="stat-figure" value={annualInvested} />
        </div>
        <div className="stat-block">
          <span className="stat-label">Monthly subscriptions</span>
          <Money className="stat-figure" value={-monthlySubscriptionsTotal} />
        </div>
        <div className="stat-block">
          <span className="stat-label">Annual subscriptions</span>
          <Money className="stat-figure" value={-annualSubscriptionsTotal} />
        </div>
        <div className="stat-block stat-block-wide">
          <span className="stat-label">Total including investments (after subscriptions)</span>
          <Money className="stat-figure stat-figure-lg" value={totalIncludingInvestments} />
        </div>
        <div className="stat-block">
          <span className="stat-label">Monthly allocated spending</span>
          <Money className="stat-figure" value={-monthlyAllocatedSpending} />
        </div>
        <div className="stat-block">
          <span className="stat-label">Annual allocated spending</span>
          <Money className="stat-figure" value={-annualAllocatedSpending} />
        </div>
        <div className="stat-block stat-block-wide">
          <div className="stat-label-row">
            <span className="stat-label">
              Projected monthly take-home after allocated spending
              {includeInvestments && ' (incl. investments)'}
            </span>
            <label className="investments-toggle">
              <input
                type="checkbox"
                checked={includeInvestments}
                onChange={(e) => setIncludeInvestments(e.target.checked)}
              />
              Include investments
            </label>
          </div>
          <Money
            className="stat-figure stat-figure-lg"
            value={includeInvestments ? projectedMonthlyTakeHomeWithInvestments : projectedMonthlyTakeHome}
          />
        </div>
        <div className="stat-block stat-block-wide">
          <span className="stat-label">
            Projected annual take-home after allocated spending
            {includeInvestments && ' (incl. investments)'}
          </span>
          <Money
            className="stat-figure stat-figure-lg"
            value={includeInvestments ? projectedAnnualTakeHomeWithInvestments : projectedAnnualTakeHome}
          />
        </div>
      </section>

      <h2>Remaining budget by category</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Monthly remaining</th>
            <th>Fiscal YTD remaining</th>
            <th>Yearly remaining</th>
          </tr>
        </thead>
        <tbody>
          {categoryRows.map((row) => (
            <tr key={row.id}>
              <td className="nowrap">{row.name}</td>
              <td>
                <Money value={row.monthlyRemaining} />
              </td>
              <td>
                <Money value={row.fiscalYtdRemaining} />
              </td>
              <td>
                <Money value={row.yearlyRemaining} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Amount spent this month so far</h2>
      <p className="page-description">Uncheck a category to leave it out of the selected total below — e.g. rent and utilities.</p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Category</th>
            <th>Spent this month</th>
          </tr>
        </thead>
        <tbody>
          {categoryRows.map((row) => (
            <tr key={row.id} className={excludedCategoryIds.has(row.id) ? 'purchase-cancelled' : undefined}>
              <td>
                <input
                  type="checkbox"
                  checked={!excludedCategoryIds.has(row.id)}
                  onChange={() => toggleCategoryIncluded(row.id)}
                />
              </td>
              <td className="nowrap">{row.name}</td>
              <td>
                <Money value={-row.thisMonthSpend} />
              </td>
            </tr>
          ))}
          <tr>
            <td></td>
            <td className="nowrap">
              <strong>Total</strong>
            </td>
            <td>
              <Money value={-totalSpentThisMonth} />
            </td>
          </tr>
          <tr>
            <td></td>
            <td className="nowrap">
              <strong>Selected total</strong>
            </td>
            <td>
              <Money value={-selectedTotalSpentThisMonth} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
