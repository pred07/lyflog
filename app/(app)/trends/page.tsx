'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserLogs } from '@/lib/firebase/firestore';
import { DailyLog } from '@/lib/types/log';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TrendsPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [metricX, setMetricX] = useState<string>('sleep');
    const [metricY, setMetricY] = useState<string>('workout');

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

    const getValue = (log: DailyLog, metric: string) => {
        if (metric === 'workout') return log.workout?.duration;
        if (metric === 'sleep') return log.sleep;
        if (metric === 'meditation') return log.meditation;
        if (metric === 'learning') return log.learning;
        // Custom metrics
        return log.metrics?.[metric];
    };

    const getScatterData = () => {
        return logs
            .filter(log => {
                const xValue = getValue(log, metricX);
                const yValue = getValue(log, metricY);
                return xValue !== undefined && yValue !== undefined;
            })
            .map(log => ({
                x: getValue(log, metricX),
                y: getValue(log, metricY),
            }));
    };

    const calculateCorrelation = () => {
        const data = getScatterData();
        if (data.length < 2) return null;

        const n = data.length;
        const sumX = data.reduce((sum, d) => sum + (d.x || 0), 0);
        const sumY = data.reduce((sum, d) => sum + (d.y || 0), 0);
        const sumXY = data.reduce((sum, d) => sum + (d.x || 0) * (d.y || 0), 0);
        const sumX2 = data.reduce((sum, d) => sum + Math.pow(d.x || 0, 2), 0);
        const sumY2 = data.reduce((sum, d) => sum + Math.pow(d.y || 0, 2), 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        if (denominator === 0) return null;
        return numerator / denominator;
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <p style={{ color: 'var(--text-secondary)' }}>Loading data...</p>
            </div>
        );
    }

    const scatterData = getScatterData();
    const correlation = calculateCorrelation();

    const standardMetrics = {
        sleep: 'Sleep (hours)',
        workout: 'Workout (minutes)',
        meditation: 'Meditation (minutes)',
        learning: 'Learning (minutes)',
    };

    const customMetrics = user?.metrics?.reduce((acc, m) => ({
        ...acc,
        [m.id]: m.label
    }), {}) || {};

    const allLabels: Record<string, string> = { ...standardMetrics, ...customMetrics };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Trends
            </h1>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                Explore correlations between different metrics.
            </p>

            {/* Disclaimer */}
            <div className="mb-6 p-4 rounded-lg" style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)'
            }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    ℹ️ <strong>Observed association. Not causation.</strong> Correlations show patterns, not explanations.
                </p>
            </div>

            {/* Metric Selectors */}
            <div className="card mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            X-Axis Metric
                        </label>
                        <select
                            value={metricX}
                            onChange={(e) => setMetricX(e.target.value)}
                            className="input-field"
                        >
                            {Object.entries(allLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Y-Axis Metric
                        </label>
                        <select
                            value={metricY}
                            onChange={(e) => setMetricY(e.target.value)}
                            className="input-field"
                        >
                            {Object.entries(allLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Scatter Plot */}
            <div className="card mb-6">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {allLabels[metricX]} vs {allLabels[metricY]}
                </h2>
                {scatterData.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Not enough data points for this comparison.
                    </p>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={400}>
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name={allLabels[metricX]}
                                    stroke="var(--text-secondary)"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name={allLabels[metricY]}
                                    stroke="var(--text-secondary)"
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                                <Scatter
                                    data={scatterData}
                                    fill="var(--chart-primary)"
                                />
                            </ScatterChart>
                        </ResponsiveContainer>
                        {correlation !== null && (
                            <div className="mt-4 p-3 rounded" style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                border: '1px solid var(--border)'
                            }}>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    <strong>Correlation coefficient:</strong> {correlation.toFixed(3)}
                                    <br />
                                    <span className="text-xs">
                                        (Range: -1 to 1. Values near 0 indicate little to no linear relationship.)
                                    </span>
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Data Summary */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Data Summary
                </h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div>
                        <strong>Total entries:</strong> {logs.length}
                    </div>
                    <div>
                        <strong>Data points in comparison:</strong> {scatterData.length}
                    </div>
                </div>
            </div>
        </div>
    );
}
