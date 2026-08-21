import { useState, type FormEvent } from 'react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import { PageHeader } from '../components/layout/PageHeader';
import { SubscriptionRow } from '../components/SubscriptionRow';

export function SubscriptionsPage() {
  const { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription } =
    useSubscriptions();
  const { categories } = useBudgetCategories();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [billingDate, setBillingDate] = useState(1);
  const [categoryId, setCategoryId] = useState('');

  if (loading) return <div className="page-loading">Loading…</div>;

  const activeCategories = categories.filter((c) => !c.archived);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || amount <= 0) return;
    await addSubscription({
      name,
      amount,
      billingDate,
      active: true,
      ...(categoryId ? { categoryId } : {}),
    });
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
          Category (optional)
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">None</option>
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
          <SubscriptionRow
            key={s.id}
            subscription={s}
            categories={activeCategories}
            onUpdate={updateSubscription}
            onDelete={deleteSubscription}
          />
        ))}
      </ul>
    </div>
  );
}
