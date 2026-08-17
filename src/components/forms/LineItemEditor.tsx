import type { LineItem } from '../../types/models';

let counter = 0;
function makeId() {
  counter += 1;
  return `item-${Date.now()}-${counter}`;
}

interface Props {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  unit: string;
  addLabel: string;
}

export function LineItemEditor({ items, onChange, unit, addLabel }: Props) {
  function updateItem(id: string, updates: Partial<LineItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function addItem() {
    onChange([...items, { id: makeId(), label: '', amount: 0 }]);
  }

  return (
    <>
      {items.map((item) => (
        <div className="field-row line-item-row" key={item.id}>
          <input
            className="line-item-label"
            placeholder="Label"
            value={item.label}
            onChange={(e) => updateItem(item.id, { label: e.target.value })}
          />
          <span className="field-unit">{unit}</span>
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder="0"
            value={item.amount || ''}
            onChange={(e) => updateItem(item.id, { amount: Number(e.target.value) })}
          />
          <button
            type="button"
            className="line-item-remove"
            onClick={() => removeItem(item.id)}
            aria-label="Remove"
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-add-item" onClick={addItem}>
        {addLabel}
      </button>
    </>
  );
}
