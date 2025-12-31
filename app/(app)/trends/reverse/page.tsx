'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserLogs } from '@/lib/firebase/firestore';
import { DailyLog } from '@/lib/types/log';
import { ArrowLeft, Search, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function ReverseEngineeringPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Search Criteria
    const [targetMetric, setTargetMetric] = useState<string>('focus');
    const [operator, setOperator] = useState<'>' | '<' | '='>('>');
    const [targetValue, setTargetValue] = useState<number>(3);

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

        if (user) loadLogs();
    }, [user]);

    // Helper to get value from log safely
    const getValue = (log: DailyLog, metric: string): number | undefined => {
        if (metric === 'sleep') return log.sleep;
        if (metric === 'workout') return log.workout?.duration;
        if (metric === 'meditation') return log.meditation;
        if (metric === 'learning') return log.learning;
        if (metric === 'anxiety') return log.anxiety;
        if (metric === 'energy') return log.energy;
        if (metric === 'focus') return log.focus;
        return log.metrics?.[metric];
    };

    // Filter Logic
    const matchingDays = logs.filter(log => {
        const val = getValue(log, targetMetric);
        if (val === undefined) return false;

        switch (operator) {
            case '>': return val > targetValue;
            case '<': return val < targetValue;
            case '=': return val === targetValue;
            default: return false;
        }
    });

    // Analysis Logic
    const analyzeContext = () => {
        const total = matchingDays.length;
        if (total === 0) return [];

        const checkCondition = (condition: (log: DailyLog) => boolean, label: string) => {
            const count = matchingDays.filter(condition).length;
            const percentage = Math.round((count / total) * 100);
            return { label, count, percentage };
        };

        const analyses = [
            checkCondition(l => (l.sleep || 0) >= 7, "Sleep 7+ hours"),
            checkCondition(l => (l.workout?.duration || 0) >= 30, "Workout 30+ min"),
            checkCondition(l => (l.meditation || 0) >= 10, "Meditation 10+ min"),
            checkCondition(l => (l.anxiety || 0) <= 2, "Anxiety Low (<= 2)"),
            checkCondition(l => (l.energy || 0) >= 4, "Energy High (>= 4)"),
        ];

        return analyses.sort((a, b) => b.percentage - a.percentage);
    };

    const analysisResults = analyzeContext();

    // Available metrics option list
    const metricsOptions = [
        { id: 'focus', label: 'Focus (1-5)' },
        { id: 'anxiety', label: 'Anxiety (1-5)' },
        { id: 'energy', label: 'Energy (1-5)' },
        { id: 'sleep', label: 'Sleep (hours)' },
        { id: 'workout', label: 'Workout (min)' },
        { id: 'meditation', label: 'Meditation (min)' },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">Loading history...</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <Link href="/trends" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Trends
            </Link>

            <header className="mb-8">
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Search size={24} /> Reverse Search
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Start with the outcome ("When did I feel...") to see what preceded it.
                </p>
            </header>

            {/* Query Builder */}
            <div className="p-6 rounded-xl mb-8" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="flex flex-wrap items-center gap-3 text-lg">
                    <span className="text-gray-500 font-medium">When was</span>

                    <select
                        value={targetMetric}
                        onChange={(e) => setTargetMetric(e.target.value)}
                        className="bg-transparent border-b-2 border-dashed border-gray-400 font-semibold focus:border-indigo-500 focus:outline-none px-1 py-0.5"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {metricsOptions.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>

                    <select
                        value={operator}
                        onChange={(e) => setOperator(e.target.value as any)}
                        className="bg-transparent border-b-2 border-dashed border-gray-400 font-semibold focus:border-indigo-500 focus:outline-none px-1 py-0.5 w-16 text-center"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <option value=">">&gt;</option>
                        <option value="<">&lt;</option>
                        <option value="=">=</option>
                    </select>

                    <input
                        type="number"
                        value={targetValue}
                        onChange={(e) => setTargetValue(Number(e.target.value))}
                        className="bg-transparent border-b-2 border-dashed border-gray-400 font-semibold focus:border-indigo-500 focus:outline-none px-1 py-0.5 w-20 text-center"
                        style={{ color: 'var(--text-primary)' }}
                    />

                    <span className="text-gray-500 font-medium">?</span>
                </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Found {matchingDays.length} matching days
                    </h2>
                    <span className="text-sm text-gray-400">
                        ({Math.round((matchingDays.length / (logs.length || 1)) * 100)}% of total history)
                    </span>
                </div>

                {matchingDays.length > 0 ? (
                    <div className="grid gap-4">
                        <div className="p-5 rounded-xl border border-[var(--border)]" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <div className="flex items-center gap-2 mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
                                <BarChart2 size={16} /> Frequency Analysis
                            </div>

                            <div className="space-y-4">
                                {analysisResults.map((result, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="flex justify-between text-sm mb-1 z-10 relative">
                                            <span style={{ color: 'var(--text-secondary)' }}>{result.label}</span>
                                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                {result.percentage}% <span className="text-xs text-gray-400 font-normal">({result.count}/{matchingDays.length})</span>
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500/50 rounded-full transition-all duration-500"
                                                style={{ width: `${result.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="mt-6 text-xs text-center text-gray-400 italic">
                                "On {analysisResults[0]?.percentage}% of these days, you also had {analysisResults[0]?.label}."
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                        No days found matching these criteria.
                    </div>
                )}
            </div>
        </div>
    );
}
