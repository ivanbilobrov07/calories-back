import { useState } from 'react';
import { updateLog, deleteLog } from '../api/logs';

export default function MealCard({ log, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(log.quantityG);
  const [mealType, setMealType] = useState(log.mealType);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateLog(log.id, { quantityG: Number(qty), mealType });
      onUpdate(res.data);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this entry?')) return;
    try {
      await deleteLog(log.id);
      onDelete(log.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <div className="meal-card">
      <div className="meal-card-main">
        <div className="meal-card-name">{log.food.name}</div>
        {editing ? (
          <div className="meal-card-edit">
            <input
              type="number"
              value={qty}
              min={1}
              onChange={e => setQty(e.target.value)}
              className="input-sm"
            />
            <span>g</span>
            <select value={mealType} onChange={e => setMealType(e.target.value)} className="input-sm">
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
            <button onClick={handleSave} disabled={saving} className="btn-primary btn-sm">
              {saving ? '…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        ) : (
          <div className="meal-card-meta">
            <span>{log.quantityG} g</span>
            <span className="dot">·</span>
            <span>{Math.round(log.totalKcal)} kcal</span>
            <span className="dot">·</span>
            <span>P {log.totalProtein.toFixed(1)}g</span>
            <span className="dot">·</span>
            <span>F {log.totalFat.toFixed(1)}g</span>
            <span className="dot">·</span>
            <span>C {log.totalCarbs.toFixed(1)}g</span>
          </div>
        )}
      </div>
      {!editing && (
        <div className="meal-card-actions">
          <button onClick={() => setEditing(true)} className="btn-icon" title="Edit">✏️</button>
          <button onClick={handleDelete} className="btn-icon" title="Delete">🗑️</button>
        </div>
      )}
    </div>
  );
}
