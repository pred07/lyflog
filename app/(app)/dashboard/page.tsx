'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserLogs } from '@/lib/firebase/firestore';
import { DailyLog } from '@/lib/types/log';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { Activity, TrendingUp, Brain } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
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
            loadData();
        }
    }, [user]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (logs.length === 0) return null;

        const last30Days = logs.slice(0, 30);
        const workoutDays = last30Days.filter(l => l.workoutDone);
        const nonWorkoutDays = last30Days.filter(l => !l.workoutDone);
        const workoutFrequency = (workoutDays.length / last30Days.length) * 100;

        const avgMood = last30Days.reduce((sum, l) => sum + l.mood, 0) / last30Days.length;
        const avgEnergy = last30Days.reduce((sum, l) => sum + l.energy, 0) / last30Days.length;
        const avgStress = last30Days.reduce((sum, l) => sum + l.stress, 0) / last30Days.length;

        // Calculate correlations (Pearson correlation coefficient)
        const calculateCorrelation = (metric: 'mood' | 'energy' | 'stress') => {
            if (last30Days.length < 2) return 0; // Need at least 2 data points

            const pairs = last30Days.map(l => ({
                workout: l.workoutDone ? 1 : 0,
                value: l[metric]
            }));

            const n = pairs.length;
            const sumX = pairs.reduce((sum, p) => sum + p.workout, 0);
            const sumY = pairs.reduce((sum, p) => sum + p.value, 0);
            const sumXY = pairs.reduce((sum, p) => sum + p.workout * p.value, 0);
            const sumX2 = pairs.reduce((sum, p) => sum + p.workout * p.workout, 0);
            const sumY2 = pairs.reduce((sum, p) => sum + p.value * p.value, 0);

            const numerator = n * sumXY - sumX * sumY;
            const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

            if (denominator === 0 || !isFinite(denominator)) return 0;
            const r = numerator / denominator;
            return isFinite(r) ? r : 0;
        };

        const moodCorr = calculateCorrelation('mood');
        const energyCorr = calculateCorrelation('energy');
        const stressCorr = calculateCorrelation('stress');

        // Workout days vs non-workout days comparison
        const workoutMood = workoutDays.length > 0
            ? workoutDays.reduce((sum, l) => sum + l.mood, 0) / workoutDays.length
            : 0;
        const nonWorkoutMood = nonWorkoutDays.length > 0
            ? nonWorkoutDays.reduce((sum, l) => sum + l.mood, 0) / nonWorkoutDays.length
            : 0;

        const moodDiff = nonWorkoutMood > 0 && workoutMood > 0
            ? ((workoutMood - nonWorkoutMood) / nonWorkoutMood) * 100
            : 0;

        return {
            workoutFrequency,
            avgMood,
            avgEnergy,
            avgStress,
            correlations: {
                mood: moodCorr,
                energy: energyCorr,
                stress: stressCorr
            },
            moodDiff,
            sampleSize: last30Days.length,
            hasEnoughData: last30Days.length >= 3 // Flag for UI messaging
        };
    }, [logs]);

    // Prepare chart data (last 30 days)
    const chartData = useMemo(() => {
        const days = 30;
        const dateRange = Array.from({ length: days }, (_, i) => {
            const date = subDays(new Date(), days - 1 - i);
            return startOfDay(date);
        });

        return dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const log = logs.find(l => format(l.date, 'yyyy-MM-dd') === dateStr);

            return {
                date: format(date, 'MMM dd'),
                mood: log?.mood || null,
                energy: log?.energy || null,
                stress: log?.stress || null,
                workout: log?.workoutDone ? 5 : 0, // Show as vertical bar
            };
        });
    }, [logs]);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    SYNAPSE Dashboard
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Personal biometric observatory • Last 30 days
                </p>
            </header>

            {logs.length === 0 ? (
                <div className="card p-8 text-center">
                    <p style={{ color: 'var(--text-secondary)' }}>
                        No data logged yet. Start by logging your first day.
                    </p>
                </div>
            ) : (
                <>
                    {/* Summary Statistics */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="card p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity size={20} className="text-indigo-500" />
                                    <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                        Activity Frequency
                                    </h3>
                                </div>
                                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {stats.workoutFrequency.toFixed(0)}%
                                </p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                    of days with physical activity
                                </p>
                            </div>

                            <div className="card p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp size={20} className="text-emerald-500" />
                                    <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                        Mean States
                                    </h3>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm">
                                        <span style={{ color: 'var(--text-tertiary)' }}>Mood:</span>{' '}
                                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {stats.avgMood.toFixed(2)}
                                        </span>
                                    </p>
                                    <p className="text-sm">
                                        <span style={{ color: 'var(--text-tertiary)' }}>Energy:</span>{' '}
                                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {stats.avgEnergy.toFixed(2)}
                                        </span>
                                    </p>
                                    <p className="text-sm">
                                        <span style={{ color: 'var(--text-tertiary)' }}>Stress:</span>{' '}
                                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {stats.avgStress.toFixed(2)}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="card p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain size={20} className="text-purple-500" />
                                    <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                        Activity Impact
                                    </h3>
                                </div>
                                <p className="text-3xl font-bold" style={{ color: stats.moodDiff > 0 ? 'var(--chart-primary)' : 'var(--text-primary)' }}>
                                    {stats.moodDiff > 0 ? '+' : ''}{stats.moodDiff.toFixed(0)}%
                                </p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                    mood elevation on workout days
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Multi-Metric Trend Chart */}
                    <div className="card p-6 mb-8">
                        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Temporal Dynamics (30-day window)
                        </h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        domain={[0, 5]}
                                        tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--bg-secondary)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="mood"
                                        stroke="#8b5cf6"
                                        fill="url(#colorMood)"
                                        strokeWidth={2}
                                        name="Mood"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="energy"
                                        stroke="#10b981"
                                        fill="url(#colorEnergy)"
                                        strokeWidth={2}
                                        name="Energy"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="stress"
                                        stroke="#f59e0b"
                                        fill="url(#colorStress)"
                                        strokeWidth={2}
                                        name="Stress"
                                    />
                                    {/* Workout days as vertical reference lines */}
                                    {chartData.map((d, i) =>
                                        d.workout > 0 ? (
                                            <ReferenceLine
                                                key={i}
                                                x={d.date}
                                                stroke="#6366f1"
                                                strokeDasharray="3 3"
                                                opacity={0.3}
                                            />
                                        ) : null
                                    )}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-tertiary)' }}>
                            Dashed vertical lines indicate workout days
                        </p>
                    </div>

                    {/* Correlation Analysis */}
                    {stats && (
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                                Statistical Correlations (Activity × Subjective States)
                            </h2>

                            {!stats.hasEnoughData && (
                                <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        ⚠️ Limited data available (n={stats.sampleSize}). Correlation analysis requires at least 3-5 data points for meaningful results. Continue logging to see statistical patterns.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                            Activity-Mood Correlation
                                        </span>
                                        <span className="text-sm font-mono font-semibold" style={{
                                            color: stats.correlations.mood > 0.3 ? '#10b981' : 'var(--text-primary)'
                                        }}>
                                            r = {stats.correlations.mood.toFixed(3)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all"
                                            style={{
                                                width: `${Math.abs(stats.correlations.mood) * 100}%`,
                                                backgroundColor: stats.correlations.mood > 0 ? '#10b981' : '#ef4444'
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                        {stats.correlations.mood > 0.3
                                            ? 'Positive correlation observed between physical activity and mood elevation'
                                            : stats.correlations.mood < -0.3
                                                ? 'Inverse correlation detected'
                                                : 'Weak or no significant correlation (n=' + stats.sampleSize + ')'}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                            Activity-Energy Correlation
                                        </span>
                                        <span className="text-sm font-mono font-semibold" style={{
                                            color: stats.correlations.energy > 0.3 ? '#10b981' : 'var(--text-primary)'
                                        }}>
                                            r = {stats.correlations.energy.toFixed(3)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all"
                                            style={{
                                                width: `${Math.abs(stats.correlations.energy) * 100}%`,
                                                backgroundColor: stats.correlations.energy > 0 ? '#10b981' : '#ef4444'
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                        {stats.correlations.energy > 0.3
                                            ? 'Elevated dopaminergic activity typically associated with physical exercise'
                                            : 'Pattern suggests variable energy response to activity'}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                            Activity-Stress Correlation
                                        </span>
                                        <span className="text-sm font-mono font-semibold" style={{
                                            color: stats.correlations.stress < -0.3 ? '#10b981' : 'var(--text-primary)'
                                        }}>
                                            r = {stats.correlations.stress.toFixed(3)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all"
                                            style={{
                                                width: `${Math.abs(stats.correlations.stress) * 100}%`,
                                                backgroundColor: stats.correlations.stress < 0 ? '#10b981' : '#ef4444'
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                        {stats.correlations.stress < -0.3
                                            ? 'Cortisol regulation appears improved with consistent activity'
                                            : 'Stress variance shows minimal correlation with activity patterns'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                    <strong>Note:</strong> Correlation coefficients (r) range from -1 to +1. Values &gt; 0.3 suggest positive association,
                                    &lt; -0.3 suggest inverse association. Sample size: n={stats.sampleSize}. These are observational patterns, not causal claims.
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
