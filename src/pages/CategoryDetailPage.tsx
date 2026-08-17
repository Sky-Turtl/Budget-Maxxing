import { useParams } from 'react-router-dom';
import { usePurchases } from '../hooks/usePurchases';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import { useUserProfile } from '../contexts/UserProfileContext';
import {
  computeMonthSpend,
  computeThisMonthRemaining,
  computeFiscalYtdRemaining,
  computeFullYearRemaining,
} from '../domain/spending/categoryMetrics';
import { getElapsedFiscalMonths, getFiscalYearBounds } from '../domain/spending/fiscalYear';
import { formatMoney } from '../utils/money';
import { Money } from '../components/Money';
import { PageHeader } from '../components/layout/PageHeader';

export function CategoryDetailPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { categories, loading: categoriesLoading } = useBudgetCategories();
  const { purchases, loading: purchasesLoading } = usePurchases();
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions();
  const { profile, loading: profileLoading } = useUserProfile();

  if (categoriesLoading || purchasesLoading || subscriptionsLoading || profileLoading || !profile) {
    return <div className="page-loading">Loading…</div>;
  }

  const category = categories.find((c) => c.id === categoryId);
  if (!category || !categoryId) return <p>Category not found.</p>;

  const now = new Date();
  const fiscalStartMonth = profile.fiscalYearStartMonth;
  const { start: fyStart, end: fyEnd } = getFiscalYearBounds(now, fiscalStartMonth);
  const elapsedMonths = getElapsedFiscalMonths(now, fiscalStartMonth);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const thisMonthSpend = computeMonthSpend(purchases, subscriptions, categoryId, monthStart, monthEnd);

  let ytdSpend = 0;
  for (let cursor = new Date(fyStart); cursor < fyEnd && cursor <= now; cursor.setMonth(cursor.getMonth() + 1)) {
    const mStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const mEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    ytdSpend += computeMonthSpend(purchases, subscriptions, categoryId, mStart, mEnd);
  }

  const thisMonthRemaining = computeThisMonthRemaining(category.monthlyBudget, thisMonthSpend);
  const fiscalYtdRemaining = computeFiscalYtdRemaining(category.monthlyBudget, elapsedMonths, ytdSpend);
  const fullYearRemaining = computeFullYearRemaining(category.monthlyBudget, ytdSpend);

  const categoryPurchases = [...purchases]
    .filter((p) => p.categoryId === categoryId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="category-detail-page">
      <PageHeader
        title={category.name}
        description="How this category is tracking against its budget — this month, cumulative since your fiscal year started, and against the full annual budget regardless of month."
      />
      <p className="eyebrow-line">
        Monthly budget <Money value={category.monthlyBudget} />
      </p>

      <section className="results stat-grid">
        <div className="stat-block">
          <span className="stat-label">This month remaining</span>
          <Money className="stat-figure" value={thisMonthRemaining} />
        </div>
        <div className="stat-block">
          <span className="stat-label">Fiscal year-to-date remaining</span>
          <Money className="stat-figure" value={fiscalYtdRemaining} />
        </div>
        <div className="stat-block">
          <span className="stat-label">Full-year budget remaining</span>
          <Money className="stat-figure" value={fullYearRemaining} />
        </div>
      </section>

      <h2>Purchase history</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Location</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {categoryPurchases.map((p) => (
            <tr key={p.id}>
              <td>{p.date}</td>
              <td>{formatMoney(p.amount)}</td>
              <td>{p.location}</td>
              <td>{p.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
