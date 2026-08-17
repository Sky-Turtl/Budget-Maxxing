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
  const totalIncludingInvestments = annualTakeHome + annualInvested;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const fiscalStartMonth = profile.fiscalYearStartMonth;
  const { start: fyStart, end: fyEnd } = getFiscalYearBounds(now, fiscalStartMonth);
  const elapsedMonths = getElapsedFiscalMonths(now, fiscalStartMonth);

  const activeCategories = categories.filter((c) => !c.archived);
  const categoryRows = activeCategories.map((c) => {
    const thisMonthSpend = computeMonthSpend(purchases, subscriptions, c.id, monthStart, monthEnd);
    const ytdSpend = computeFiscalYtdSpend(purchases, subscriptions, c.id, fyStart, fyEnd, now);
    return {
      id: c.id,
      name: c.name,
      monthlyRemaining: computeThisMonthRemaining(c.monthlyBudget, thisMonthSpend),
      fiscalYtdRemaining: computeFiscalYtdRemaining(c.monthlyBudget, elapsedMonths, ytdSpend),
      yearlyRemaining: computeFullYearRemaining(c.monthlyBudget, ytdSpend),
    };
  });

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
        <div className="stat-block stat-block-wide">
          <span className="stat-label">Total including investments</span>
          <Money className="stat-figure stat-figure-lg" value={totalIncludingInvestments} />
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
    </div>
  );
}
