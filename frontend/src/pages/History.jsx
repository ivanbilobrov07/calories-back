import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPaginatedLogs } from '../api/logs';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_ICONS = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎',
};

export default function History() {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        setLoading(true);
        getPaginatedLogs(1)
            .then((res) => {
                setLogs(res.data.items);
                setHasMore(res.data.hasMore);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        try {
            const res = await getPaginatedLogs(page + 1);
            setLogs((prev) => [...prev, ...res.data.items]);
            setHasMore(res.data.hasMore);
            setPage((p) => p + 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    };

    const grouped = logs.reduce((acc, log) => {
        const date = log.logDate.slice(0, 10);
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
    }, {});

    return (
        <div className="page">
            <div className="page-header">
                <h1>History</h1>
                <Link to="/search" className="btn-primary">
                    + Add Meal
                </Link>
            </div>

            {loading ? (
                <div className="page-loading">Loading…</div>
            ) : logs.length === 0 ? (
                <p className="empty-hint">No meals logged yet.</p>
            ) : (
                <>
                    {Object.entries(grouped).map(([date, dayLogs]) => {
                        const totalKcal = dayLogs.reduce(
                            (s, l) => s + l.totalKcal,
                            0,
                        );
                        const totalProtein = dayLogs.reduce(
                            (s, l) => s + l.totalProtein,
                            0,
                        );
                        const totalFat = dayLogs.reduce(
                            (s, l) => s + l.totalFat,
                            0,
                        );
                        const totalCarbs = dayLogs.reduce(
                            (s, l) => s + l.totalCarbs,
                            0,
                        );

                        const displayDate = new Date(
                            date + 'T00:00:00',
                        ).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        });

                        return (
                            <div key={date} className="history-day">
                                {/* Day header */}
                                <div className="history-day-header">
                                    <span className="history-day-date">
                                        {displayDate}
                                    </span>
                                    <div className="history-day-totals">
                                        <span>
                                            {Math.round(totalKcal)} kcal
                                        </span>
                                        <span className="dot">·</span>
                                        <span>
                                            P {totalProtein.toFixed(1)}g
                                        </span>
                                        <span className="dot">·</span>
                                        <span>F {totalFat.toFixed(1)}g</span>
                                        <span className="dot">·</span>
                                        <span>C {totalCarbs.toFixed(1)}g</span>
                                    </div>
                                </div>

                                {/* Meal cards grid */}
                                <div className="history-meals-grid">
                                    {MEAL_TYPES.map((type) => {
                                        const meal = dayLogs.find(
                                            (l) => l.mealType === type,
                                        );
                                        if (!meal) return null;
                                        return (
                                            <div
                                                key={type}
                                                className="history-meal-card"
                                            >
                                                <div className="history-meal-title">
                                                    <span>
                                                        {MEAL_ICONS[type]}
                                                    </span>
                                                    <span>
                                                        {type
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            type.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="history-meal-kcal">
                                                    {Math.round(meal.totalKcal)}{' '}
                                                    kcal
                                                </div>
                                                <div className="history-meal-macros">
                                                    <span>
                                                        P{' '}
                                                        {meal.totalProtein.toFixed(
                                                            1,
                                                        )}
                                                        g
                                                    </span>
                                                    <span>
                                                        F{' '}
                                                        {meal.totalFat.toFixed(
                                                            1,
                                                        )}
                                                        g
                                                    </span>
                                                    <span>
                                                        C{' '}
                                                        {meal.totalCarbs.toFixed(
                                                            1,
                                                        )}
                                                        g
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {hasMore && (
                        <div className="load-more-wrap">
                            <button
                                className="btn-secondary"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore ? 'Loading…' : 'Load more'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
