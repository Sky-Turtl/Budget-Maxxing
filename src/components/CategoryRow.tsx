import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatMoney } from '../utils/money';
import type { BudgetCategory } from '../types/models';

interface Props {
  category: BudgetCategory;
  onUpdate: (id: string, updates: Partial<BudgetCategory>) => void;
  onDelete: (id: string) => void;
}

export function CategoryRow({ category, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [monthlyBudget, setMonthlyBudget] = useState(category.monthlyBudget);

  function startEdit() {
    setName(category.name);
    setMonthlyBudget(category.monthlyBudget);
    setEditing(true);
  }

  function save() {
    if (!name || monthlyBudget <= 0) return;
    onUpdate(category.id, { name, monthlyBudget });
    setEditing(false);
  }

  if (editing) {
    return (
      <li>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <input
          type="number"
          min={0}
          step={0.01}
          value={monthlyBudget || ''}
          onChange={(e) => setMonthlyBudget(Number(e.target.value))}
        />
        <span className="row-actions">
          <button type="button" className="btn btn-outline" onClick={save}>
            Save
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </span>
      </li>
    );
  }

  return (
    <li>
      <Link to={`/categories/${category.id}`}>{category.name}</Link> — {formatMoney(category.monthlyBudget)}/mo
      <span className="row-actions">
        <button type="button" className="btn-link" onClick={startEdit}>
          Edit
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            if (window.confirm(`Permanently delete "${category.name}"? This can't be undone.`)) {
              onDelete(category.id);
            }
          }}
        >
          Delete
        </button>
      </span>
    </li>
  );
}
