import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createCustomFood, searchFoods } from '../api/foods';
import { createLog } from '../api/logs';

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

const EMPTY_CUSTOM = {
    name: '',
    kcalPer100g: '',
    proteinPer100g: '',
    fatPer100g: '',
    carbsPer100g: '',
};

export default function FoodSearch() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const initDate = searchParams.get('date') || todayStr();
    const initMealType = searchParams.get('mealType') || 'breakfast';

    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ internal: [], external: [] });
    const [items, setItems] = useState([]);
    const [mealType, setMealType] = useState(initMealType);
    const [logDate, setLogDate] = useState(initDate);
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customFood, setCustomFood] = useState(EMPTY_CUSTOM);
    const [customError, setCustomError] = useState('');
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!query.trim()) {
            setResults({ internal: [], external: [] });
            setShowCustomForm(false);
            return;
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await searchFoods(query.trim());
                setResults(res.data);
            } catch {
                /* ignore */
            } finally {
                setSearching(false);
            }
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    const isSelected = (food) =>
        items.some((item) =>
            food.id ? item.food.id === food.id : item.food.name === food.name,
        );

    const handleToggle = (food) => {
        setError('');
        if (isSelected(food)) {
            setItems((prev) =>
                prev.filter((item) =>
                    food.id
                        ? item.food.id !== food.id
                        : item.food.name !== food.name,
                ),
            );
        } else {
            setItems((prev) => [...prev, { food, quantityG: 100 }]);
        }
    };

    const handleQtyChange = (food, qty) => {
        setItems((prev) =>
            prev.map((item) => {
                const match = food.id
                    ? item.food.id === food.id
                    : item.food.name === food.name;
                return match ? { ...item, quantityG: qty } : item;
            }),
        );
    };

    const removeItem = (food) => {
        setItems((prev) =>
            prev.filter((item) =>
                food.id
                    ? item.food.id !== food.id
                    : item.food.name !== food.name,
            ),
        );
    };

    const handleCustomChange = (field, value) => {
        setCustomFood((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddCustom = async () => {
        if (!customFood.name.trim()) {
            setCustomError('Name is required');
            return;
        }
        if (!customFood.kcalPer100g || Number(customFood.kcalPer100g) < 0) {
            setCustomError('Valid kcal is required');
            return;
        }
        setCustomError('');

        try {
            const res = await createCustomFood({
                name: customFood.name.trim(),
                kcalPer100g: Number(customFood.kcalPer100g),
                proteinPer100g: Number(customFood.proteinPer100g) || 0,
                fatPer100g: Number(customFood.fatPer100g) || 0,
                carbsPer100g: Number(customFood.carbsPer100g) || 0,
            });

            setItems((prev) => [...prev, { food: res.data, quantityG: 100 }]);
            setCustomFood(EMPTY_CUSTOM);
            setShowCustomForm(false);
            setQuery('');
        } catch (err) {
            setCustomError(
                err.response?.data?.error || 'Failed to create food',
            );
        }
    };

    const totalKcal = items.reduce(
        (acc, { food, quantityG }) =>
            acc + (food.kcalPer100g * Number(quantityG)) / 100,
        0,
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!items.length) {
            setError('Select at least one food item');
            return;
        }
        if (items.some((i) => !i.quantityG || i.quantityG <= 0)) {
            setError('All quantities must be greater than 0');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await createLog({
                mealType,
                logDate,
                items: items.map(({ food, quantityG }) => ({
                    quantityG: Number(quantityG),
                    ...(food.id ? { foodId: food.id } : { externalFood: food }),
                })),
            });
            navigate(`/log?date=${logDate}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add meal');
        } finally {
            setSubmitting(false);
        }
    };

    const allResults = [
        ...results.internal.map((f) => ({ ...f, _src: 'db' })),
        ...results.external.map((f) => ({ ...f, _src: 'off' })),
    ];

    const noResults = query && !searching && allResults.length === 0;

    return (
        <div className="page">
            <div className="page-header">
                <h1>Find Food</h1>
            </div>

            <div className="search-layout">
                <div className="search-panel">
                    <div className="search-input-wrap">
                        <input
                            type="text"
                            placeholder="Search foods…"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowCustomForm(false);
                            }}
                            autoFocus
                            className="search-input"
                        />
                        {searching && <span className="search-spinner">…</span>}
                    </div>

                    {allResults.length > 0 && (
                        <div className="search-results">
                            {results.internal.length > 0 && (
                                <div className="results-section">
                                    <p className="results-label">
                                        My Foods / Database
                                    </p>
                                    {results.internal.map((food) => (
                                        <FoodResultItem
                                            key={food.id}
                                            food={food}
                                            selected={isSelected(food)}
                                            onToggle={handleToggle}
                                        />
                                    ))}
                                </div>
                            )}
                            {results.external.length > 0 && (
                                <div className="results-section">
                                    <p className="results-label">USDA</p>
                                    {results.external.map((food, i) => (
                                        <FoodResultItem
                                            key={i}
                                            food={food}
                                            selected={isSelected(food)}
                                            onToggle={handleToggle}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* No results */}
                    {noResults && !showCustomForm && (
                        <div className="no-results">
                            <p className="empty-hint">
                                No results found for "{query}".
                            </p>
                            <button
                                type="button"
                                className="btn-secondary btn-sm"
                                onClick={() => {
                                    setShowCustomForm(true);
                                    setCustomFood((prev) => ({
                                        ...prev,
                                        name: query,
                                    }));
                                }}
                            >
                                + Add "{query}" manually
                            </button>
                        </div>
                    )}

                    {/* Custom food form */}
                    {showCustomForm && (
                        <div className="custom-food-form card">
                            <div className="custom-food-form-header">
                                <h4>Add custom food</h4>
                                <button
                                    type="button"
                                    className="btn-remove"
                                    onClick={() => setShowCustomForm(false)}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={customFood.name}
                                    onChange={(e) =>
                                        handleCustomChange(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Food name"
                                />
                            </div>
                            <div className="custom-food-macros">
                                <div className="form-group">
                                    <label>Kcal / 100g</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={customFood.kcalPer100g}
                                        onChange={(e) =>
                                            handleCustomChange(
                                                'kcalPer100g',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Protein (g)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={customFood.proteinPer100g}
                                        onChange={(e) =>
                                            handleCustomChange(
                                                'proteinPer100g',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fat (g)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={customFood.fatPer100g}
                                        onChange={(e) =>
                                            handleCustomChange(
                                                'fatPer100g',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Carbs (g)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={customFood.carbsPer100g}
                                        onChange={(e) =>
                                            handleCustomChange(
                                                'carbsPer100g',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            {customError && (
                                <p className="form-error">{customError}</p>
                            )}
                            <button
                                type="button"
                                className="btn-primary btn-sm"
                                onClick={handleAddCustom}
                            >
                                Add to selection
                            </button>
                        </div>
                    )}
                </div>

                <div className="log-form-panel">
                    <div className="card">
                        <h3>Log Details</h3>
                        {items.length > 0 && (
                            <div className="selected-items">
                                {items.map(({ food, quantityG }) => (
                                    <div
                                        className="selected-item"
                                        key={food.id || food.name}
                                    >
                                        <div className="selected-item-header">
                                            <strong>{food.name}</strong>
                                            <button
                                                type="button"
                                                className="btn-remove"
                                                onClick={() => removeItem(food)}
                                                title="Remove"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className="selected-item-controls">
                                            <input
                                                type="number"
                                                min={1}
                                                value={quantityG}
                                                onChange={(e) =>
                                                    handleQtyChange(
                                                        food,
                                                        e.target.value,
                                                    )
                                                }
                                                className="qty-input"
                                            />
                                            <span className="qty-label">
                                                g · ≈{' '}
                                                {Math.round(
                                                    (food.kcalPer100g *
                                                        Number(quantityG)) /
                                                        100,
                                                )}{' '}
                                                kcal
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div className="total-kcal">
                                    Total:{' '}
                                    <strong>
                                        {Math.round(totalKcal)} kcal
                                    </strong>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="log-form">
                            <div className="form-group">
                                <label>Meal type</label>
                                <select
                                    value={mealType}
                                    onChange={(e) =>
                                        setMealType(e.target.value)
                                    }
                                >
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                    <option value="snack">Snack</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={logDate}
                                    max={todayStr()}
                                    onChange={(e) => setLogDate(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="form-error">{error}</p>}
                            <button
                                type="submit"
                                className="btn-primary btn-full"
                                disabled={submitting || !items.length}
                            >
                                {submitting
                                    ? 'Adding…'
                                    : `Add ${items.length ? `(${items.length})` : ''} to log`}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FoodResultItem({ food, selected, onToggle }) {
    return (
        <button
            type="button"
            className={`food-result-item ${selected ? 'selected' : ''}`}
            onClick={() => onToggle(food)}
        >
            <div className="food-result-name">
                {selected && <span className="check">✓ </span>}
                {food.name}
            </div>
            <div className="food-result-meta">
                {food.kcalPer100g} kcal · P {food.proteinPer100g}g · F{' '}
                {food.fatPer100g}g · C {food.carbsPer100g}g
                {food.source === 'usda' && <span className="badge">USDA</span>}
                {food.source === 'custom' && (
                    <span className="badge badge-custom">custom</span>
                )}
            </div>
        </button>
    );
}
