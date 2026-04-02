import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getLogs } from '../api/logs';
import MealCard from '../components/MealCard';
import MacroPieChart from '../components/MacroPieChart';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function History() {
  const [date, setDate] = useState(todayStr());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const totalKcal = logs.reduce((s, l) => s + l.totalKcal, 0);
  const totalProtein = logs.reduce((s, l) => s + l.totalProtein, 0);
  const totalFat = logs.reduce((s, l) => s + l.totalFat, 0);
  const totalCarbs = logs.reduce((s, l) => s + l.totalCarbs, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1>History</h1>
        <Link to={`/search?date=${date}`} className="btn-primary">+ Add Meal</Link>
      </div>

      <div className="form-group date-picker-row">
        <label htmlFor="history-date">Browse date</label>
        <input
          id="history-date"
          type="date"
          value={date}
          max={todayStr()}
          onChange={e => setDate(e.target.value)}
        />
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
                  </div>
                  {entries.length === 0 ? (
                    <p className="empty-hint">Nothing logged</p>
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
              <h3>Day Summary</h3>
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
