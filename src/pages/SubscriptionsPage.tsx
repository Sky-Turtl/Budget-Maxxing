import { useState, type FormEvent } from 'react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import { formatMoney } from '../utils/money';

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
      <h1>Subscriptions</h1>

      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          type="number"
          min={0}
          placeholder="Amount"
          value={amount || ''}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <input
          type="number"
          min={1}
          max={31}
          placeholder="Billing day"
          value={billingDate}
          onChange={(e) => setBillingDate(Number(e.target.value))}
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="" disabled>
            Category
          </option>
          {activeCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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
