import { useState, type FormEvent } from 'react';
import { usePurchases } from '../hooks/usePurchases';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import { PageHeader } from '../components/layout/PageHeader';
import { PurchaseRow } from '../components/PurchaseRow';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function PurchaseLogPage() {
  const { purchases, loading, addPurchase, updatePurchase, deletePurchase } = usePurchases();
  const { categories } = useBudgetCategories();
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  if (loading) return <div className="page-loading">Loading…</div>;

  const activeCategories = categories.filter((c) => !c.archived);
  const sign = sortDir === 'desc' ? -1 : 1;
  const recent = [...purchases]
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -sign : sign;
      return a.createdAt < b.createdAt ? -sign : sign;
    })
    .slice(0, 20);

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
        <div className="form-row">
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
        </div>
        <div className="form-row">
          <label>
            Location
            <input value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>
          <label>
            Notes (optional)
            <input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>
        <button type="submit">Log purchase</button>
      </form>

      <h2>Recent purchases</h2>
      <table>
        <thead>
          <tr>
            <th>
              <button
                type="button"
                className="th-sort"
                onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              >
                Date {sortDir === 'desc' ? '↓' : '↑'}
              </button>
            </th>
            <th>Amount</th>
            <th>Category</th>
            <th>Location</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {recent.map((p) => (
            <PurchaseRow
              key={p.id}
              purchase={p}
              categories={categories}
              onUpdate={updatePurchase}
              onDelete={deletePurchase}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
