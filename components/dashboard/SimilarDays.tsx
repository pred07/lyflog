'use client';

import { useState, useMemo } from 'react';
import { DailyLog } from '@/lib/types/log';
import { findSimilarDays } from '@/lib/analysis/stats';
import { format, differenceInDays } from 'date-fns';
import { Calendar, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';

interface SimilarDaysProps {
    today: DailyLog;
    history: DailyLog[];
    metrics: string[]; // which metrics to use for comparison
}

export default function SimilarDays({ today, history, metrics }: SimilarDaysProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const matches = useMemo(() => {
        // Only run if we have enough data (e.g. at least 5 days history) and today has some data
        if (history.length < 5) return [];
        return findSimilarDays(today, history, metrics, 3);
    }, [today, history, metrics]);

    if (matches.length === 0) return null;

    return (
        <div className="card mb-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Activity size={18} className="text-indigo-500" />
                    Deja Vu
                </h3>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-indigo-500 font-medium hover:underline"
                >
                    {isExpanded ? 'Show Less' : 'What followed?'}
                </button>
            </div>

            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Today&apos;s pattern resembles these past days. Here is what happened next.
            </p>

            <div className={`space-y-3 ${isExpanded ? '' : 'max-h-48 overflow-hidden mask-bottom'}`}>
                {matches.map(({ log, distance }) => {
                    const matchPercentage = Math.max(0, 100 - Math.round(distance * 100)); // Rough "percentage"
                    const diff = differenceInDays(new Date(), log.date);

                    // Simple "Validation": Show one prominent metric from the NEXT day if available (as a subtle "what happens next" hint)
                    // We need to find the day AFTER this log
                    const nextDayDateStr = format(new Date(log.date.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
                    const nextDayLog = history.find(l => format(l.date, 'yyyy-MM-dd') === nextDayDateStr);

                    return (
                        <div key={log.logId} className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                        {format(log.date, 'EEE, MMM d, yyyy')}
                                    </div>
                                    <span className="text-xs text-gray-400">({diff} days ago)</span>
                                </div>
                                <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                                    {matchPercentage}% Match
                                </div>
                            </div>

                            {/* Comparison of Key Drivers */}
                            {/* We could show "High Anxiety, Low Sleep" tags here but keeping it simple first */}

                            {/* What Happened Next */}
                            {nextDayLog ? (
                                <div className="mt-2 text-xs border-t border-gray-200 dark:border-gray-700 pt-2 flex items-center gap-2 text-gray-500">
                                    <ArrowRight size={12} />
                                    <span>Next day:</span>
                                    {nextDayLog.sleep && nextDayLog.sleep > 0 && <span className="font-medium text-gray-700 dark:text-gray-300">Sleep {nextDayLog.sleep}h</span>}
                                    {nextDayLog.metrics?.['mood'] && nextDayLog.metrics['mood'] > 0 && <span className="font-medium text-gray-700 dark:text-gray-300">Mood {nextDayLog.metrics['mood']}/5</span>}
                                    {nextDayLog.workout?.duration && nextDayLog.workout.duration > 0 && <span className="font-medium text-gray-700 dark:text-gray-300">Workout {nextDayLog.workout.duration}m</span>}
                                </div>
                            ) : (
                                <div className="mt-2 text-xs text-gray-400 italic">No data recorded for the following day.</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
