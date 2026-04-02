export default function ProgressBar({ consumed, goal }) {
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const over = goal > 0 && consumed > goal;

  return (
    <div className="progress-wrap">
      <div className="progress-bar-bg">
        <div
          className={`progress-bar-fill ${over ? 'over' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="progress-labels">
        <span>{Math.round(consumed)} kcal consumed</span>
        <span>{goal ? `${goal} kcal goal` : 'No goal set'}</span>
      </div>
    </div>
  );
}
