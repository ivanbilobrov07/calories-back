import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getLogs } from '../api/logs';
import MealCard from '../components/MealCard';
import MacroPieChart from '../components/MacroPieChart';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function MealLog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const date = searchParams.get('date') || todayStr();

  const fetchLogs = useCallback(() => {
    setLoading(true);
    getLogs(date)
      .then(res => setLogs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleUpdate = (updated) =>
    setLogs(prev => prev.map(l => l.id === updated.id ? updated : l));

  const handleDelete = (id) =>
    setLogs(prev => prev.filter(l => l.id !== id));

  const goToDate = (d) => setSearchParams({ date: d });

  const totalKcal = logs.reduce((s, l) => s + l.totalKcal, 0);
  const totalProtein = logs.reduce((s, l) => s + l.totalProtein, 0);
  const totalFat = logs.reduce((s, l) => s + l.totalFat, 0);
  const totalCarbs = logs.reduce((s, l) => s + l.totalCarbs, 0);

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Meal Log</h1>
          <div className="date-nav">
            <button onClick={() => goToDate(shiftDate(date, 0))} className="btn-icon">←</button>
            <span className="text-muted">{displayDate}</span>
            <button
              onClick={() => goToDate(shiftDate(date, 2))}
              className="btn-icon"
              disabled={date >= todayStr()}
            >→</button>
          </div>
        </div>
        <Link to={`/search?date=${date}`} className="btn-primary">+ Add Meal</Link>
      </div>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <div className="log-layout">
          <div className="log-main">
            {MEAL_TYPES.map(type => {
              const entries = logs.filter(l => l.mealType === type);
              return (
                <div key={type} className="meal-group">
                  <div className="meal-group-header">
                    <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                    <span className="meal-group-kcal">
                      {Math.round(entries.reduce((s, l) => s + l.totalKcal, 0))} kcal
                    </span>
                    <Link to={`/search?date=${date}&mealType=${type}`} className="btn-sm btn-secondary">
                      + Add
                    </Link>
                  </div>
                  {entries.length === 0 ? (
                    <p className="empty-hint">Nothing logged yet</p>
                  ) : (
                    entries.map(log => (
                      <MealCard key={log.id} log={log} onUpdate={handleUpdate} onDelete={handleDelete} />
                    ))
                  )}
                </div>
              );
            })}
          </div>

          <div className="log-sidebar">
            <div className="card">
              <h3>Summary</h3>
              <div className="summary-row"><span>Calories</span><strong>{Math.round(totalKcal)} kcal</strong></div>
              <div className="summary-row"><span>Protein</span><strong>{totalProtein.toFixed(1)} g</strong></div>
              <div className="summary-row"><span>Fat</span><strong>{totalFat.toFixed(1)} g</strong></div>
              <div className="summary-row"><span>Carbs</span><strong>{totalCarbs.toFixed(1)} g</strong></div>
            </div>
            <div className="card">
              <MacroPieChart protein={totalProtein} fat={totalFat} carbs={totalCarbs} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
