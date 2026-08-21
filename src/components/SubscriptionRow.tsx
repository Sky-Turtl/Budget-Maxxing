import { useState } from 'react';
import { formatMoney } from '../utils/money';
import type { BudgetCategory, Subscription } from '../types/models';

interface Props {
  subscription: Subscription;
  categories: BudgetCategory[];
  onUpdate: (id: string, updates: Partial<Subscription>) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionRow({ subscription, categories, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(subscription);

  function startEdit() {
    setDraft(subscription);
    setEditing(true);
  }

  function save() {
    if (!draft.name || draft.amount <= 0) return;
    onUpdate(subscription.id, {
      name: draft.name,
      amount: draft.amount,
      billingDate: draft.billingDate,
      categoryId: draft.categoryId || undefined,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <li>
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <input
          type="number"
          min={0}
          step={0.01}
          value={draft.amount || ''}
          onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
        />
        <input
          type="number"
          min={1}
          max={31}
          value={draft.billingDate}
          onChange={(e) => setDraft({ ...draft, billingDate: Number(e.target.value) })}
        />
        <select
          value={draft.categoryId ?? ''}
          onChange={(e) => setDraft({ ...draft, categoryId: e.target.value || undefined })}
        >
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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
      {subscription.name} — {formatMoney(subscription.amount)}/mo, billed day {subscription.billingDate} —{' '}
      {subscription.categoryId
        ? categories.find((c) => c.id === subscription.categoryId)?.name ?? 'Unknown category'
        : 'No category'}
      <label>
        <input
          type="checkbox"
          checked={subscription.active}
          onChange={(e) => onUpdate(subscription.id, { active: e.target.checked })}
        />
        Active
      </label>
      <span className="row-actions">
        <button type="button" className="btn-link" onClick={startEdit}>
          Edit
        </button>
        <button
          type="button"
          className="btn-link btn-link-danger"
          onClick={() => {
            if (window.confirm(`Delete subscription "${subscription.name}"?`)) onDelete(subscription.id);
          }}
        >
          Delete
        </button>
      </span>
    </li>
  );
}
