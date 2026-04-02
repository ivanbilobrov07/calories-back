import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useAuth } from '../context/AuthContext';

export default function WeeklyChart({ data }) {
  const { user } = useAuth();
  const goal = user?.dailyGoalKcal;

  const formatted = data.map(d => ({
    ...d,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })
  }));

  return (
    <div className="chart-container">
      <h3>7-Day Calorie Intake</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={45} />
          <Tooltip formatter={(v) => [`${v} kcal`, 'Calories']} />
          {goal && <ReferenceLine y={goal} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Goal', fontSize: 11 }} />}
          <Bar dataKey="totalKcal" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
