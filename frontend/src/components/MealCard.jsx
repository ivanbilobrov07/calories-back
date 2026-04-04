import { useState } from 'react';
import { updateLog, deleteLog } from '../api/logs';

export default function MealCard({ log, onUpdate, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [items, setItems] = useState(
        log.items.map((item) => ({
            food: item.food,
            quantityG: item.quantityG,
        })),
    );
    const [mealType, setMealType] = useState(log.mealType);
    const [saving, setSaving] = useState(false);

    const handleQtyChange = (foodId, val) => {
        setItems((prev) =>
            prev.map((i) =>
                i.food.id === foodId ? { ...i, quantityG: val } : i,
            ),
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await updateLog(log.id, {
                mealType,
                items: items.map(({ food, quantityG }) => ({
                    foodId: food.id,
                    quantityG: Number(quantityG),
                })),
            });
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
                {editing ? (
                    <div className="meal-card-edit">
                        {items.map(({ food, quantityG }) => (
                            <div key={food.id} className="meal-card-edit-row">
                                <span className="meal-card-edit-name">
                                    {food.name}
                                </span>
                                <input
                                    type="number"
                                    value={quantityG}
                                    min={1}
                                    onChange={(e) =>
                                        handleQtyChange(food.id, e.target.value)
                                    }
                                    className="input-sm"
                                />
                                <span>g</span>
                                <span className="text-muted">
                                    ≈{' '}
                                    {Math.round(
                                        (food.kcalPer100g * Number(quantityG)) /
                                            100,
                                    )}{' '}
                                    kcal
                                </span>
                            </div>
                        ))}

                        <div className="meal-card-edit-actions">
                            <select
                                value={mealType}
                                onChange={(e) => setMealType(e.target.value)}
                                className="input-sm"
                            >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                            </select>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary btn-sm"
                            >
                                {saving ? '…' : 'Save'}
                            </button>
                            <button
                                onClick={() => setEditing(false)}
                                className="btn-secondary btn-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {log.items.map((item) => (
                            <div key={item.food.id} className="meal-card-item">
                                <span className="meal-card-name">
                                    {item.food.name}
                                </span>
                                <span className="meal-card-meta">
                                    {item.quantityG} g
                                    <span className="dot">·</span>
                                    {Math.round(
                                        (item.food.kcalPer100g *
                                            item.quantityG) /
                                            100,
                                    )}{' '}
                                    kcal
                                </span>
                            </div>
                        ))}

                        <div className="meal-card-meta meal-card-total">
                            <span>Total {Math.round(log.totalKcal)} kcal</span>
                            <span className="dot">·</span>
                            <span>P {log.totalProtein.toFixed(1)}g</span>
                            <span className="dot">·</span>
                            <span>F {log.totalFat.toFixed(1)}g</span>
                            <span className="dot">·</span>
                            <span>C {log.totalCarbs.toFixed(1)}g</span>
                        </div>
                    </div>
                )}
            </div>

            {!editing && (
                <div className="meal-card-actions">
                    <button
                        onClick={() => setEditing(true)}
                        className="btn-icon"
                        title="Edit"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={handleDelete}
                        className="btn-icon"
                        title="Delete"
                    >
                        🗑️
                    </button>
                </div>
            )}
        </div>
    );
}
