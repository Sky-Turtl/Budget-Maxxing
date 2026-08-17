import { useState, type FormEvent } from 'react';
import { usePurchases } from '../hooks/usePurchases';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import { formatMoney } from '../utils/money';
import { PageHeader } from '../components/layout/PageHeader';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function PurchaseLogPage() {
  const { purchases, loading, addPurchase, updatePurchase } = usePurchases();
  const { categories } = useBudgetCategories();
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  if (loading) return <div className="page-loading">Loading…</div>;

  const activeCategories = categories.filter((c) => !c.archived);
  const recent = [...purchases].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 20);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (amount <= 0 || !categoryId) return;
    await addPurchase({ date, amount, categoryId, location, notes: notes || undefined });
    setAmount(0);
    setLocation('');
    setNotes('');
  }

  return (
    <div className="purchase-log-page">
      <PageHeader
        title="Log a Purchase"
        description="Record what you spent, when, and where — it counts against that category's monthly and fiscal-year budget immediately."
      />

      <form onSubmit={handleSubmit}>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Amount
          <input
            type="number"
            min={0}
            step={0.01}
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
        </label>
        <label>
          Category
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
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
        <label>
          Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </label>
        <label>
          Notes (optional)
          <input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <button type="submit">Log purchase</button>
      </form>

      <h2>Recent purchases</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Location</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {recent.map((p) => (
            <tr key={p.id} className={p.cancelled ? 'purchase-cancelled' : undefined}>
              <td>{p.date}</td>
              <td>{formatMoney(p.amount)}</td>
              <td>{categories.find((c) => c.id === p.categoryId)?.name ?? 'Unknown'}</td>
              <td>{p.location}</td>
              <td>{p.notes}</td>
              <td>
                <label className="cancelled-toggle">
                  <input
                    type="checkbox"
                    checked={!!p.cancelled}
                    onChange={(e) => updatePurchase(p.id, { cancelled: e.target.checked })}
                  />
                  Cancelled
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
