import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

export default function MacroPieChart({ protein, fat, carbs }) {
    const data = [
        { name: 'Protein', value: Math.round(protein * 10) / 10 },
        { name: 'Fat', value: Math.round(fat * 10) / 10 },
        { name: 'Carbs', value: Math.round(carbs * 10) / 10 },
    ].filter((d) => d.value > 0);

    if (data.length === 0) return null;

    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <div className="chart-container">
            <h3>Macronutrient Breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={80}
                        innerRadius={50}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(v) => [
                            `${v}g (${Math.round((v / total) * 100)}%)`,
                        ]}
                    />
                    <Legend
                        formatter={(name, entry) =>
                            `${name}: ${entry.payload.value}g`
                        }
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
