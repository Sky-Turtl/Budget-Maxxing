import { useState, type FormEvent } from 'react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import { formatMoney } from '../utils/money';
import { PageHeader } from '../components/layout/PageHeader';

export function SubscriptionsPage() {
  const { subscriptions, loading, addSubscription, updateSubscription } = useSubscriptions();
  const { categories } = useBudgetCategories();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [billingDate, setBillingDate] = useState(1);
  const [categoryId, setCategoryId] = useState('');

  if (loading) return <div className="page-loading">Loading…</div>;

  const activeCategories = categories.filter((c) => !c.archived);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || amount <= 0 || !categoryId) return;
    await addSubscription({ name, amount, billingDate, categoryId, active: true });
    setName('');
    setAmount(0);
  }

  return (
    <div className="subscriptions-page">
      <PageHeader
        title="Subscriptions"
        description="Recurring charges you don't want to log by hand — each active subscription's monthly cost is folded automatically into its category's spending total on the day it bills."
      />

      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Amount
          <input
            type="number"
            min={0}
            step={0.01}
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
        <label>
          Billing day
          <input
            type="number"
            min={1}
            max={31}
            value={billingDate}
            onChange={(e) => setBillingDate(Number(e.target.value))}
          />
        </label>
        <label>
          Category
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="" disabled>
              Select
            </option>
            {activeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Add subscription</button>
      </form>

      <ul className="subscription-list">
        {subscriptions.map((s) => (
          <li key={s.id}>
            {s.name} — {formatMoney(s.amount)}/mo, billed day {s.billingDate} —{' '}
            {categories.find((c) => c.id === s.categoryId)?.name ?? 'Unknown category'}
            <label>
              <input
                type="checkbox"
                checked={s.active}
                onChange={(e) => updateSubscription(s.id, { active: e.target.checked })}
              />
              Active
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
