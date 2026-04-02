import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

export default function MacroPieChart({ protein, fat, carbs }) {
  const data = [
    { name: 'Protein', value: Math.round(protein * 10) / 10 },
    { name: 'Fat', value: Math.round(fat * 10) / 10 },
    { name: 'Carbs', value: Math.round(carbs * 10) / 10 }
  ].filter(d => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="chart-container">
      <h3>Macronutrient Breakdown</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}g`}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => [`${v}g`]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
