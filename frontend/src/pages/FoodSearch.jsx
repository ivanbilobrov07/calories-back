import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchFoods } from '../api/foods';
import { createLog } from '../api/logs';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function FoodSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initDate = searchParams.get('date') || todayStr();
  const initMealType = searchParams.get('mealType') || 'breakfast';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ internal: [], external: [] });
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(100);
  const [mealType, setMealType] = useState(initMealType);
  const [logDate, setLogDate] = useState(initDate);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ internal: [], external: [] });
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

  const handleSelect = (food) => {
    setSelected(food);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) { setError('Select a food item first'); return; }
    if (!qty || qty <= 0) { setError('Enter a valid quantity'); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        quantityG: Number(qty),
        mealType,
        logDate
      };
      if (selected.id) {
        payload.foodId = selected.id;
      } else {
        payload.externalFood = selected;
      }
      await createLog(payload);
      navigate(`/log?date=${logDate}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add meal');
    } finally {
      setSubmitting(false);
    }
  };

  const allResults = [
    ...results.internal.map(f => ({ ...f, _src: 'db' })),
    ...results.external.map(f => ({ ...f, _src: 'off' }))
  ];

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
              onChange={e => { setQuery(e.target.value); setSelected(null); }}
              autoFocus
              className="search-input"
            />
            {searching && <span className="search-spinner">…</span>}
          </div>

          {allResults.length > 0 && (
            <div className="search-results">
              {results.internal.length > 0 && (
                <div className="results-section">
                  <p className="results-label">My Foods / Database</p>
                  {results.internal.map(food => (
                    <FoodResultItem
                      key={food.id}
                      food={food}
                      selected={selected?.id === food.id}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )}
              {results.external.length > 0 && (
                <div className="results-section">
                  <p className="results-label">Open Food Facts</p>
                  {results.external.map((food, i) => (
                    <FoodResultItem
                      key={i}
                      food={food}
                      selected={selected?.name === food.name && !selected?.id}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {query && !searching && allResults.length === 0 && (
            <p className="empty-hint">No results found. Try a different query or <a href="/search?addCustom=1">add a custom food</a>.</p>
          )}
        </div>

        <div className="log-form-panel">
          <div className="card">
            <h3>Log Details</h3>
            {selected && (
              <div className="selected-food">
                <strong>{selected.name}</strong>
                <span className="text-muted">
                  {selected.kcalPer100g} kcal · P {selected.proteinPer100g}g · F {selected.fatPer100g}g · C {selected.carbsPer100g}g per 100g
                </span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="log-form">
              <div className="form-group">
                <label>Quantity (g)</label>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={e => setQty(e.target.value)}
                  required
                />
                {selected && qty > 0 && (
                  <span className="form-hint">
                    ≈ {Math.round(selected.kcalPer100g * qty / 100)} kcal
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>Meal type</label>
                <select value={mealType} onChange={e => setMealType(e.target.value)}>
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
                  onChange={e => setLogDate(e.target.value)}
                  required
                />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="btn-primary btn-full" disabled={submitting || !selected}>
                {submitting ? 'Adding…' : 'Add to log'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function FoodResultItem({ food, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`food-result-item ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(food)}
    >
      <div className="food-result-name">{food.name}</div>
      <div className="food-result-meta">
        {food.kcalPer100g} kcal · P {food.proteinPer100g}g · F {food.fatPer100g}g · C {food.carbsPer100g}g
        {food.source === 'openfoodfacts' && <span className="badge">OFF</span>}
        {food.source === 'custom' && <span className="badge badge-custom">custom</span>}
      </div>
    </button>
  );
}
