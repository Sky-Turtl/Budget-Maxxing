import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePaycheckConfig, usePostTaxAllocations } from '../hooks/usePaycheckConfig';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { usePurchases } from '../hooks/usePurchases';
import { computePaycheck } from '../domain/paycheck/computePaycheck';
import { computeMonthSpend } from '../domain/spending/categoryMetrics';
import { formatMoney } from '../utils/money';

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
  const allocationsTotal = allocations
    ? allocations.otherPersonalContributions +
      allocations.setAsideSavings +
      allocations.rothIRA +
      allocations.gifts +
      allocations.debtPayments
    : 0;

  const monthlyTakeHome = paycheck.netMonthly - allocationsTotal;
  const annualTakeHome = monthlyTakeHome * 12;
  const monthlyInvested = paycheck.total401k / 12 + (allocations?.rothIRA ?? 0);
  const annualInvested = paycheck.total401k + (allocations?.rothIRA ?? 0) * 12;
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
      <h1>Summary</h1>

      <section className="results">
        <h2>Take-home</h2>
        <p>Monthly: {formatMoney(monthlyTakeHome)}</p>
        <p>Annual: {formatMoney(annualTakeHome)}</p>

        <h2>Invested</h2>
        <p>Monthly: {formatMoney(monthlyInvested)}</p>
        <p>Annual: {formatMoney(annualInvested)}</p>

        <h2>Total including investments</h2>
        <p>{formatMoney(totalIncludingInvestments)}</p>
      </section>

      <h2>This month: budget vs. spent by category</h2>
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 50)}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={120} />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Bar dataKey="budget" fill="#8884d8" />
            <Bar dataKey="spent" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
