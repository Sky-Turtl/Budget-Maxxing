import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import { formatMoney } from '../utils/money';

export function BudgetCategoriesPage() {
  const { categories, loading, addCategory, archiveCategory } = useBudgetCategories();
  const [name, setName] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState(0);

  if (loading) return <div className="page-loading">Loading…</div>;

  const active = categories.filter((c) => !c.archived);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || monthlyBudget <= 0) return;
    await addCategory(name, monthlyBudget);
    setName('');
    setMonthlyBudget(0);
  }

  return (
    <div className="categories-page">
      <h1>Budget Categories</h1>

      <form onSubmit={handleSubmit}>
        <input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          type="number"
          min={0}
          placeholder="Monthly budget"
          value={monthlyBudget || ''}
          onChange={(e) => setMonthlyBudget(Number(e.target.value))}
        />
        <button type="submit">Add category</button>
      </form>

      <ul className="category-list">
        {active.map((c) => (
          <li key={c.id}>
            <Link to={`/categories/${c.id}`}>{c.name}</Link> — {formatMoney(c.monthlyBudget)}/mo
            <button onClick={() => archiveCategory(c.id)}>Archive</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
