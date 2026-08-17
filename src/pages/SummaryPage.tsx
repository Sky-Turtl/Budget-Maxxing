import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePaycheckConfig, usePostTaxAllocations } from '../hooks/usePaycheckConfig';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { usePurchases } from '../hooks/usePurchases';
import { computePaycheck } from '../domain/paycheck/computePaycheck';
import { computeMonthSpend } from '../domain/spending/categoryMetrics';
import { formatMoney } from '../utils/money';
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
  const activeCategories = categories.filter((c) => !c.archived);
  const chartData = activeCategories.map((c) => ({
    name: c.name,
    budget: c.monthlyBudget,
    spent: computeMonthSpend(purchases, subscriptions, c.id, monthStart, monthEnd),
  }));

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

      <h2>This month: budget vs. spent by category</h2>
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 50)}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={120} />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Bar dataKey="budget" fill="#B8912F" radius={[0, 3, 3, 0]} />
            <Bar dataKey="spent" fill="#16302B" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
