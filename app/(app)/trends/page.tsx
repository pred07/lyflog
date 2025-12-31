'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserLogs } from '@/lib/firebase/firestore';
import { DailyLog } from '@/lib/types/log';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateCorrelation, getMetricValue } from '@/lib/analysis/stats';

export default function TrendsPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [metricX, setMetricX] = useState<string>('sleep');
    const [metricY, setMetricY] = useState<string>('workout');

    useEffect(() => {
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

        if (user) {
            loadLogs();
        }
    }, [user]);




    const getScatterData = () => {
        return logs
            .filter(log => {
                const xValue = getMetricValue(log, metricX);
                const yValue = getMetricValue(log, metricY);
                return xValue !== undefined && yValue !== undefined;
            })
            .map(log => ({
                x: getMetricValue(log, metricX),
                y: getMetricValue(log, metricY),
            }));
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <p style={{ color: 'var(--text-secondary)' }}>Loading data...</p>
            </div>
        );
    }

    const scatterData = getScatterData();
    const correlation = calculateCorrelation(logs, metricX, metricY);

    const standardMetrics = {
        sleep: 'Sleep (hours)',
        workout: 'Workout (minutes)',
        meditation: 'Meditation (minutes)',
        learning: 'Learning (minutes)',
    };

    const customMetricsLabels = user?.metrics?.reduce((acc, m) => ({
        ...acc,
        [m.id]: m.label
    }), {}) || {};

    const exposureLabels = user?.exposures?.reduce((acc, e) => ({
        ...acc,
        [e.id]: `${e.label} (${e.type})`
    }), {}) || {};

    const allLabels: Record<string, string> = {
        ...standardMetrics,
        ...customMetricsLabels,
        ...exposureLabels
    };

    const MetricSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input-field"
        >
            <optgroup label="Core Metrics">
                {Object.entries(standardMetrics).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                ))}
            </optgroup>

            {Object.keys(customMetricsLabels).length > 0 && (
                <optgroup label="Personal States">
                    {Object.entries(customMetricsLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label as string}</option>
                    ))}
                </optgroup>
            )}

            {Object.keys(exposureLabels).length > 0 && (
                <optgroup label="Exposures">
                    {Object.entries(exposureLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label as string}</option>
                    ))}
                </optgroup>
            )}
        </select>
    );

    const getInterpretation = (corr: number, xLabel: string, yLabel: string, count: number) => {
        // Only show interpretation if we have enough data and a meaningful correlation
        if (count < 10 || Math.abs(corr) < 0.3) return null;

        const strength = Math.abs(corr) >= 0.6 ? "consistently" : "tends to be";
        const direction = corr > 0 ? "higher" : "lower";

        // Clean labels for text (remove units/parentheses)
        const cleanX = xLabel.split('(')[0].trim().toLowerCase();
        const cleanY = yLabel.split('(')[0].trim(); // Keep Case for Y usually start of sentence? No, middle.

        return `Observations show ${cleanY.toLowerCase()} ${strength} ${direction} on days with higher ${cleanX}.`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Trends
            </h1>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                Explore correlations between different metrics.
            </p>

            <div className="mb-8">
                <a href="/trends/network" className="inline-flex items-center text-sm font-medium text-indigo-500 hover:text-indigo-600 transition-colors">
                    View Network Map →
                </a>
            </div>

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
                        <MetricSelect value={metricX} onChange={setMetricX} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Y-Axis Metric
                        </label>
                        <MetricSelect value={metricY} onChange={setMetricY} />
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
                            <div className="mt-4 p-4 rounded-xl" style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                border: '1px solid var(--border)'
                            }}>
                                <div className="flex items-start gap-4">
                                    {/* Confidence Visual Indicator */}
                                    <div className="pt-1">
                                        <div
                                            className="w-4 h-4 rounded-full border border-[var(--chart-primary)]"
                                            style={{
                                                background: scatterData.length >= 50
                                                    ? 'var(--chart-primary)'
                                                    : scatterData.length >= 20
                                                        ? 'linear-gradient(90deg, var(--chart-primary) 50%, transparent 50%)'
                                                        : 'transparent'
                                            }}
                                            title={
                                                scatterData.length >= 50 ? "High Confidence" :
                                                    scatterData.length >= 20 ? "Emerging Pattern" : "Insufficient Data"
                                            }
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                {correlation.toFixed(2)}
                                            </span>
                                            <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                                Correlation
                                            </span>
                                        </div>

                                        {/* Silent Indicator / Interpretation */}
                                        {(() => {
                                            const interpretation = getInterpretation(correlation, allLabels[metricX], allLabels[metricY], scatterData.length);
                                            return interpretation && (
                                                <p className="text-sm font-medium mb-3 italic" style={{ color: 'var(--text-primary)' }}>
                                                    &quot;{interpretation}&quot;
                                                </p>
                                            );
                                        })()}

                                        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                                            {scatterData.length < 20 && (
                                                <>Based on {scatterData.length} days. Needs {50 - scatterData.length} more for high confidence.</>
                                            )}
                                            {scatterData.length >= 20 && scatterData.length < 50 && (
                                                <>Based on {scatterData.length} days. Needs {50 - scatterData.length} more for high confidence.</>
                                            )}
                                            {scatterData.length >= 50 && (
                                                <>High confidence based on {scatterData.length} days.</>
                                            )}
                                        </p>

                                        <p className="text-xs text-gray-400">
                                            (Range: -1.0 to 1.0. Values near 0 indicate no observed relationship.)
                                        </p>
                                    </div>
                                </div>
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
