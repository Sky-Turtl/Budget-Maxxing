import { useState } from 'react';
import { formatMoney } from '../utils/money';
import type { BudgetCategory, Purchase } from '../types/models';

interface Props {
  purchase: Purchase;
  categories?: BudgetCategory[];
  onUpdate: (id: string, updates: Partial<Purchase>) => void;
  onDelete: (id: string) => void;
}

export function PurchaseRow({ purchase, categories, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(purchase);

  function startEdit() {
    setDraft(purchase);
    setEditing(true);
  }

  function save() {
    onUpdate(purchase.id, {
      date: draft.date,
      amount: draft.amount,
      categoryId: draft.categoryId,
      location: draft.location,
      notes: draft.notes,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <tr>
        <td>
          <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        </td>
        <td>
          <input
            type="number"
            min={0}
            step={0.01}
            value={draft.amount || ''}
            onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
          />
        </td>
        {categories && (
          <td>
            <select
              value={draft.categoryId}
              onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
            >
              {!categories.some((c) => c.id === draft.categoryId) && <option value={draft.categoryId}>?</option>}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </td>
        )}
        <td>
          <input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
        </td>
        <td>
          <input value={draft.notes ?? ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
        </td>
        <td className="row-actions">
          <button type="button" className="btn btn-outline" onClick={save}>
            Save
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className={purchase.cancelled ? 'purchase-cancelled' : undefined}>
      <td>{purchase.date}</td>
      <td>{formatMoney(purchase.amount)}</td>
      {categories && (
        <td>{categories.find((c) => c.id === purchase.categoryId)?.name ?? '?'}</td>
      )}
      <td>{purchase.location}</td>
      <td className="notes-cell">
        {purchase.notes && (
          <span className="notes-tooltip" data-tooltip={purchase.notes}>
            <span className="notes-truncate">{purchase.notes}</span>
          </span>
        )}
      </td>
      <td className="row-actions">
        <button type="button" className="btn-link" onClick={startEdit}>
          Edit
        </button>
        <label className="cancelled-toggle">
          <input
            type="checkbox"
            checked={!!purchase.cancelled}
            onChange={(e) => onUpdate(purchase.id, { cancelled: e.target.checked })}
          />
          Cancelled
        </label>
        {purchase.cancelled && (
          <button
            type="button"
            className="btn-link btn-link-danger"
            onClick={() => {
              if (window.confirm('Permanently remove this purchase?')) onDelete(purchase.id);
            }}
          >
            Remove
          </button>
        )}
      </td>
    </tr>
  );
}
