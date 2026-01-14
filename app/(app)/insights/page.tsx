'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getInsightLog, calculateMetaPatterns, deleteInsightLogEntry } from '@/lib/firebase/reflection';
import { InsightLogEntry, MetaPattern, MOOD_FOCUS_LABELS, PERCEIVED_REASON_LABELS } from '@/lib/types/reflection';
import { format } from 'date-fns';
import { Lightbulb, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function InsightsPage() {
    const { user } = useAuth();
    const [insights, setInsights] = useState<InsightLogEntry[]>([]);
    const [metaPatterns, setMetaPatterns] = useState<MetaPattern | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            try {
                const [insightData, metaData] = await Promise.all([
                    getInsightLog(user.userId),
                    calculateMetaPatterns(user.userId)
                ]);

                setInsights(insightData);
                setMetaPatterns(metaData);
            } catch (error) {
                console.error('Error loading insights:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const handleDelete = async (entryId: string) => {
        if (!user || !confirm('Are you sure you want to delete this insight?')) return;

        try {
            await deleteInsightLogEntry(user.userId, entryId);
            setInsights(insights.filter(i => i.entryId !== entryId));
        } catch (error) {
            console.error('Error deleting insight:', error);
            alert('Failed to delete insight');
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Lightbulb size={32} className="text-yellow-500" />
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Insight Timeline
                    </h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Your self-understanding journey
                </p>
            </div>

            {insights.length === 0 ? (
                <div className="card p-8 text-center">
                    <Lightbulb size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                        No reflections yet. Start exploring your patterns.
                    </p>
                    <Link href="/reflect" className="btn-primary inline-block">
                        Start Reflection
                    </Link>
                </div>
            ) : (
                <>
                    {/* Meta-Patterns */}
                    {metaPatterns && insights.length >= 3 && (
                        <div className="card p-6 mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={20} className="text-purple-500" />
                                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Meta-Patterns
                                </h2>
                            </div>

                            {/* Most Selected Reasons */}
                            {metaPatterns.reasonFrequency.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                                        Most Selected Reasons
                                    </h3>
                                    <div className="space-y-2">
                                        {metaPatterns.reasonFrequency.slice(0, 5).map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                                    {idx + 1}. {PERCEIVED_REASON_LABELS[item.reason]}
                                                </span>
                                                <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                                                    {item.count}x ({item.percentage.toFixed(0)}%)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recurring Patterns */}
                            {metaPatterns.recurringPatterns.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                                        Recurring Patterns
                                    </h3>
                                    <div className="space-y-2">
                                        {metaPatterns.recurringPatterns.slice(0, 5).map((pattern, idx) => (
                                            <div key={idx} className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                        {pattern.patternName.replace(/-/g, ' ')}
                                                    </span>
                                                    <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                                                        {pattern.count}x
                                                    </span>
                                                </div>
                                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                    Related to: {pattern.reasons.map(r => PERCEIVED_REASON_LABELS[r]).join(', ')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pattern Shifts */}
                            {metaPatterns.shifts.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                                        Pattern Shifts
                                    </h3>
                                    <div className="space-y-2">
                                        {metaPatterns.shifts.map((shift, idx) => (
                                            <p key={idx} className="text-sm p-3 rounded" style={{
                                                backgroundColor: 'var(--bg-tertiary)',
                                                color: 'var(--text-primary)'
                                            }}>
                                                {shift}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Insight Timeline */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Calendar size={20} />
                            Timeline
                        </h2>

                        {insights.map((entry, idx) => (
                            <div key={entry.entryId} className="card p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                            {format(entry.date, 'MMM dd, yyyy')}
                                        </p>
                                        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            Explored: {MOOD_FOCUS_LABELS[entry.moodFocus]} mood
                                        </p>
                                    </div>
                                    {entry.recurrenceCount > 1 && (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium" style={{
                                            backgroundColor: 'var(--bg-tertiary)',
                                            color: 'var(--accent)'
                                        }}>
                                            {entry.recurrenceCount}x recurrence
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleDelete(entry.entryId)}
                                        className="mb-auto ml-2 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete entry"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        Lens:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {entry.perceivedReasons.map(reason => (
                                            <span
                                                key={reason}
                                                className="px-2 py-1 rounded text-xs"
                                                style={{
                                                    backgroundColor: 'var(--bg-tertiary)',
                                                    color: 'var(--text-primary)'
                                                }}
                                            >
                                                {PERCEIVED_REASON_LABELS[reason]}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        Patterns Observed:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {entry.patternsObserved.map((pattern, pidx) => (
                                            <li key={pidx} className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                                {pattern.replace(/-/g, ' ')}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {entry.userNote && (
                                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                        <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>
                                            "{entry.userNote}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* New Reflection Button */}
                    <div className="mt-8 text-center">
                        <Link href="/reflect" className="btn-primary inline-block">
                            New Reflection
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
