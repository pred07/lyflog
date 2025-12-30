'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserLogs } from '@/lib/firebase/firestore';
import { DailyLog } from '@/lib/types/log';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

type ViewMode = 'daily' | 'weekly' | 'monthly';

export default function DashboardPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('weekly');
    const [activeMetrics, setActiveMetrics] = useState({
        sleep: true,
        workout: true,
        meditation: true,
        learning: true,
    });

    useEffect(() => {
        if (user) {
            loadLogs();
        }
    }, [user]);

    const loadLogs = async () => {
        if (!user) return;
        try {
            const userLogs = await getUserLogs(user.userId);
            setLogs(userLogs);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        const days = viewMode === 'daily' ? 7 : viewMode === 'weekly' ? 30 : 90;
        const dateRange = Array.from({ length: days }, (_, i) => {
            const date = subDays(new Date(), days - 1 - i);
            return startOfDay(date);
        });

        return dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const log = logs.find(l => format(l.date, 'yyyy-MM-dd') === dateStr);

            return {
                date: format(date, 'MMM dd'),
                sleep: log?.sleep || null,
                workout: log?.workout?.duration || null,
                meditation: log?.meditation || null,
                learning: log?.learning || null,
            };
        });
    };

    const toggleMetric = (metric: keyof typeof activeMetrics) => {
        setActiveMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <p style={{ color: 'var(--text-secondary)' }}>Loading data...</p>
            </div>
        );
    }

    const chartData = getChartData();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Dashboard
            </h1>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                Observe patterns in your data over time.
            </p>

            {/* View Mode Toggle */}
            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => setViewMode('daily')}
                    className={viewMode === 'daily' ? 'btn-primary' : 'btn-secondary'}
                >
                    Daily (7 days)
                </button>
                <button
                    onClick={() => setViewMode('weekly')}
                    className={viewMode === 'weekly' ? 'btn-primary' : 'btn-secondary'}
                >
                    Weekly (30 days)
                </button>
                <button
                    onClick={() => setViewMode('monthly')}
                    className={viewMode === 'monthly' ? 'btn-primary' : 'btn-secondary'}
                >
                    Monthly (90 days)
                </button>
            </div>

            {/* Metric Toggles */}
            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => toggleMetric('sleep')}
                    className="btn-secondary text-sm"
                    style={{
                        opacity: activeMetrics.sleep ? 1 : 0.5,
                        borderColor: activeMetrics.sleep ? 'var(--chart-primary)' : 'var(--border)',
                    }}
                >
                    Sleep
                </button>
                <button
                    onClick={() => toggleMetric('workout')}
                    className="btn-secondary text-sm"
                    style={{
                        opacity: activeMetrics.workout ? 1 : 0.5,
                        borderColor: activeMetrics.workout ? 'var(--chart-secondary)' : 'var(--border)',
                    }}
                >
                    Workout
                </button>
                <button
                    onClick={() => toggleMetric('meditation')}
                    className="btn-secondary text-sm"
                    style={{
                        opacity: activeMetrics.meditation ? 1 : 0.5,
                        borderColor: activeMetrics.meditation ? 'var(--chart-tertiary)' : 'var(--border)',
                    }}
                >
                    Meditation
                </button>
                <button
                    onClick={() => toggleMetric('learning')}
                    className="btn-secondary text-sm"
                    style={{
                        opacity: activeMetrics.learning ? 1 : 0.5,
                        borderColor: activeMetrics.learning ? '#ff9f40' : 'var(--border)',
                    }}
                >
                    Learning
                </button>
            </div>

            {/* Chart */}
            <div className="card mb-8">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Activity over time
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-secondary)"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="var(--text-secondary)"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-secondary)',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                color: 'var(--text-primary)',
                            }}
                        />
                        <Legend />
                        {activeMetrics.sleep && (
                            <Line
                                type="monotone"
                                dataKey="sleep"
                                stroke="var(--chart-primary)"
                                strokeWidth={2}
                                name="Sleep (hours)"
                                connectNulls
                            />
                        )}
                        {activeMetrics.workout && (
                            <Line
                                type="monotone"
                                dataKey="workout"
                                stroke="var(--chart-secondary)"
                                strokeWidth={2}
                                name="Workout (min)"
                                connectNulls
                            />
                        )}
                        {activeMetrics.meditation && (
                            <Line
                                type="monotone"
                                dataKey="meditation"
                                stroke="var(--chart-tertiary)"
                                strokeWidth={2}
                                name="Meditation (min)"
                                connectNulls
                            />
                        )}
                        {activeMetrics.learning && (
                            <Line
                                type="monotone"
                                dataKey="learning"
                                stroke="#ff9f40"
                                strokeWidth={2}
                                name="Learning (min)"
                                connectNulls
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Recent Logs */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Recent entries
                </h2>
                {logs.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No logs yet. Start by logging your first entry.</p>
                ) : (
                    <div className="space-y-3">
                        {logs.slice(0, 5).map(log => (
                            <div
                                key={log.logId}
                                className="p-3 rounded"
                                style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {format(log.date, 'MMM dd, yyyy')}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {log.sleep && <span>Sleep: {log.sleep}h</span>}
                                    {log.workout && <span>Workout: {log.workout.duration}min</span>}
                                    {log.meditation && <span>Meditation: {log.meditation}min</span>}
                                    {log.learning && <span>Learning: {log.learning}min</span>}
                                </div>
                                {log.note && (
                                    <p className="mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                        {log.note}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
