import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLogs } from '../api/logs';
import { getWeeklyStats } from '../api/stats';
import ProgressBar from '../components/ProgressBar';
import WeeklyChart from '../components/WeeklyChart';
import MacroPieChart from '../components/MacroPieChart';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = todayStr();
    Promise.all([getLogs(today), getWeeklyStats()])
      .then(([logsRes, statsRes]) => {
        setLogs(logsRes.data);
        setWeeklyData(statsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalKcal = logs.reduce((s, l) => s + l.totalKcal, 0);
  const totalProtein = logs.reduce((s, l) => s + l.totalProtein, 0);
  const totalFat = logs.reduce((s, l) => s + l.totalFat, 0);
  const totalCarbs = logs.reduce((s, l) => s + l.totalCarbs, 0);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) return <div className="page-loading">Loading…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">{today}</p>
        </div>
        <Link to={`/log?date=${todayStr()}`} className="btn-primary">+ Add Meal</Link>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Today's Progress</h2>
          <div className="kcal-display">
            <span className="kcal-big">{Math.round(totalKcal)}</span>
            <span className="kcal-unit">kcal</span>
          </div>
          <ProgressBar consumed={totalKcal} goal={user?.dailyGoalKcal} />
          {!user?.dailyGoalKcal && (
            <p className="hint"><Link to="/profile">Set your daily goal →</Link></p>
          )}
        </div>

        <div className="card">
          <h2>Today's Macros</h2>
          <div className="macro-grid">
            <div className="macro-item">
              <span className="macro-label">Protein</span>
              <span className="macro-value">{totalProtein.toFixed(1)}g</span>
            </div>
            <div className="macro-item">
              <span className="macro-label">Fat</span>
              <span className="macro-value">{totalFat.toFixed(1)}g</span>
            </div>
            <div className="macro-item">
              <span className="macro-label">Carbs</span>
              <span className="macro-value">{totalCarbs.toFixed(1)}g</span>
            </div>
          </div>
          <MacroPieChart protein={totalProtein} fat={totalFat} carbs={totalCarbs} />
        </div>

        <div className="card card-wide">
          <WeeklyChart data={weeklyData} />
        </div>
      </div>
    </div>
  );
}
