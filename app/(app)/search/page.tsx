'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserLogs } from '@/lib/firebase/firestore';
import { DailyLog } from '@/lib/types/log';
import { getMetricValue, calculateFrequency } from '@/lib/analysis/stats';
import { format } from 'date-fns';
import { Search as SearchIcon, Filter, ArrowRight } from 'lucide-react';

export default function SearchPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedMetric, setSelectedMetric] = useState<string>('focus'); // Default
    const [operator, setOperator] = useState<'>' | '<' | '='>('>');
    const [threshold, setThreshold] = useState<number>(3);

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

    // Derived: Metrics list
    const metrics = useMemo(() => {
        const standard = [
            { id: 'sleep', label: 'Sleep' },
            { id: 'workout', label: 'Workout' },
            { id: 'meditation', label: 'Meditation' },
            { id: 'learning', label: 'Learning' },
            // Add implicit core states if they are standard but stored in metrics map?
            // Actually 'focus', 'anxiety', 'energy' are common in demo data but stored in 'metrics'.
        ];

        // Add custom metrics
        const custom = user?.metrics?.map(m => ({ id: m.id, label: m.label })) || [];
        // Add exposures? Maybe useful.
        const exposures = user?.exposures?.map(e => ({ id: e.id, label: e.label })) || [];

        return [...standard, ...custom, ...exposures];
    }, [user]);

    // Derived: Matching Days
    const matchingLogs = useMemo(() => {
        return logs.filter(log => {
            const val = getMetricValue(log, selectedMetric);
            if (val === undefined) return false;

            if (operator === '>') return val > threshold;
            if (operator === '<') return val < threshold;
            if (operator === '=') return val === threshold;
            return false;
        });
    }, [logs, selectedMetric, operator, threshold]);

    // Derived: Frequencies on matching days
    const frequencies = useMemo(() => {
        if (matchingLogs.length === 0) return [];

        const results = [];

        // Check against important benchmarks
        // Sleep > 7h
        const sleepFreq = calculateFrequency(matchingLogs, 'sleep', v => v >= 7);
        if (sleepFreq.percentage > 0) results.push({ label: 'Sleep 7+ hrs', ...sleepFreq });

        // Meditation > 0
        const medFreq = calculateFrequency(matchingLogs, 'meditation', v => v > 0);
        if (medFreq.percentage > 0) results.push({ label: 'Meditation logged', ...medFreq });

        // Workout > 0
        const workoutFreq = calculateFrequency(matchingLogs, 'workout', v => v > 0);
        if (workoutFreq.percentage > 0) results.push({ label: 'Workout logged', ...workoutFreq });

        // Low Anxiety (if trackable) - assumes anxiety is a metric 1-5
        if (metrics.find(m => m.id === 'anxiety')) {
            const lowAnxiety = calculateFrequency(matchingLogs, 'anxiety', v => v <= 2);
            if (lowAnxiety.percentage > 0) results.push({ label: 'Low Anxiety (≤2)', ...lowAnxiety });
        }

        // High Focus (if trackable)
        if (metrics.find(m => m.id === 'focus')) {
            const highFocus = calculateFrequency(matchingLogs, 'focus', v => v >= 4);
            if (highFocus.percentage > 0) results.push({ label: 'High Focus (≥4)', ...highFocus });
        }

        return results.sort((a, b) => b.percentage - a.percentage);
    }, [matchingLogs, metrics]);


    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg w-full"></div>
                    <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Search
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Reverse engineer your best days.
                </p>
            </header>

            {/* Query Builder */}
            <div className="p-6 rounded-2xl mb-8 border border-[var(--border)]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-gray-500 font-medium whitespace-nowrap">Find days where</span>
                    </div>

                    <div className="flex items-center gap-2 w-full">
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            className="input-field flex-1"
                        >
                            {metrics.map(m => (
                                <option key={m.id} value={m.id}>{m.label}</option>
                            ))}
                        </select>

                        <select
                            value={operator}
                            onChange={(e) => setOperator(e.target.value as any)}
                            className="input-field w-20 text-center"
                        >
                            <option value=">">&gt;</option>
                            <option value="<">&lt;</option>
                            <option value="=">=</option>
                        </select>

                        <input
                            type="number"
                            value={threshold}
                            onChange={(e) => setThreshold(parseFloat(e.target.value))}
                            className="input-field w-24"
                        />
                    </div>
                </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {matchingLogs.length} Matching Day{matchingLogs.length !== 1 ? 's' : ''}
                </h2>
                <div className="text-sm text-gray-400">
                    {logs.length > 0 ? Math.round((matchingLogs.length / logs.length) * 100) : 0}% of all logged days
                </div>
            </div>

            {matchingLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                    No days found matching this criteria. <br /> Try adjusting your search query.
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {/* FREQUENCY CARDS */}
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-2">
                            On these days...
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {frequencies.map((freq, i) => (
                                <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {freq.label}
                                        </span>
                                        <span className="text-lg font-bold text-indigo-500">
                                            {freq.percentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                                        <div
                                            className="bg-indigo-500 h-1.5 rounded-full"
                                            style={{ width: `${freq.percentage}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        {freq.matchingDays} / {freq.totalDays} days
                                    </div>
                                </div>
                            ))}
                            {frequencies.length === 0 && (
                                <div className="col-span-2 text-sm text-gray-400 italic">
                                    No strong commonalities found specifically for Sleep, Workout, or Meditation.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RECENT MATCHES LIST */}
                    <div>
                        <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-2">
                            Recent Matches
                        </h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {matchingLogs.slice(0, 10).map(log => (
                                <div key={log.logId} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 flex justify-between items-center group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {format(log.date, 'MMM d, yyyy')}
                                    </span>
                                    <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500" />
                                </div>
                            ))}
                            {matchingLogs.length > 10 && (
                                <div className="text-xs text-center text-gray-400 pt-2">
                                    + {matchingLogs.length - 10} more
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
