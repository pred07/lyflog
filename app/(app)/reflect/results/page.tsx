'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSearchParams, useRouter } from 'next/navigation';
import { getUserLogs } from '@/lib/firebase/firestore';
import { analyzePatterns, checkPatternRecurrence } from '@/lib/reflection/analysisEngine';
import { getRecentReflectionSessions, saveReflectionSession, saveInsightLogEntry } from '@/lib/firebase/reflection';
import {
    ReflectionSession,
    MoodFocus,
    PerceivedReason,
    MOOD_FOCUS_LABELS,
    PERCEIVED_REASON_LABELS,
    InsightLogEntry
} from '@/lib/types/reflection';
import { DailyLog } from '@/lib/types/log';
import { subDays } from 'date-fns';
import { ArrowLeft, CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

function ResultsContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [session, setSession] = useState<ReflectionSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [userNote, setUserNote] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const runAnalysis = async () => {
            if (!user) return;

            const moodFocus = searchParams.get('moodFocus') as MoodFocus;
            const reasons = searchParams.get('reasons')?.split(',') as PerceivedReason[];
            const timeWindow = parseInt(searchParams.get('timeWindow') || '14');

            if (!moodFocus || !reasons) {
                router.push('/reflect');
                return;
            }

            try {
                // Get logs for time window
                const allLogs = await getUserLogs(user.userId);
                const cutoffDate = subDays(new Date(), timeWindow);
                const windowLogs = allLogs.filter(log => log.date >= cutoffDate);

                // Run analysis
                const analysisSession = await analyzePatterns(
                    user.userId,
                    windowLogs,
                    moodFocus,
                    reasons,
                    timeWindow
                );

                // Check pattern recurrence
                const previousSessions = await getRecentReflectionSessions(user.userId, 10);
                const updatedPatterns = checkPatternRecurrence(
                    analysisSession.detectedPatterns,
                    previousSessions
                );
                analysisSession.detectedPatterns = updatedPatterns;

                // Save session
                await saveReflectionSession(analysisSession);

                setSession(analysisSession);
            } catch (error) {
                console.error('Analysis error:', error);
                alert('Error running analysis. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        runAnalysis();
    }, [user, searchParams, router]);

    const handleSaveToInsightLog = async () => {
        if (!user || !session) return;

        setSaving(true);
        try {
            const entry: InsightLogEntry = {
                entryId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId: user.userId,
                sessionId: session.sessionId,
                date: new Date(),
                moodFocus: session.moodFocus,
                perceivedReasons: session.perceivedReasons,
                patternsObserved: session.detectedPatterns.map(p => p.name),
                recurrenceCount: Math.max(...session.detectedPatterns.map(p => p.occurrences)),
                userNote,
                createdAt: new Date()
            };

            await saveInsightLogEntry(entry);
            router.push('/insights');
        } catch (error) {
            console.error('Error saving insight:', error);
            alert('Error saving to insight log');
        } finally {
            setSaving(false);
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

    if (!session) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
            {/* Header */}
            <div className="mb-6">
                <Link href="/reflect" className="text-sm flex items-center gap-2 mb-4" style={{ color: 'var(--accent)' }}>
                    <ArrowLeft size={16} />
                    Back to Reflection
                </Link>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Pattern Analysis
                </h1>
                <div className="flex flex-wrap gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>Mood Focus: <strong>{MOOD_FOCUS_LABELS[session.moodFocus]}</strong></span>
                    <span>•</span>
                    <span>Window: <strong>Last {session.timeWindow} days</strong></span>
                    <span>•</span>
                    <span>Data Points: <strong>n={session.ruleSetResults[0]?.dataPoints || 0}</strong></span>
                </div>
            </div>

            {/* Selected Lenses */}
            <div className="card p-4 mb-6">
                <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Analyzed Through:
                </h3>
                <div className="flex flex-wrap gap-2">
                    {session.perceivedReasons.map(reason => (
                        <span
                            key={reason}
                            className="px-3 py-1 rounded-full text-sm"
                            style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)'
                            }}
                        >
                            {PERCEIVED_REASON_LABELS[reason]}
                        </span>
                    ))}
                </div>
            </div>

            {/* Results for each rule set */}
            {session.ruleSetResults.map((result, idx) => (
                <div key={idx} className="card p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {result.ruleSetName}
                        </h2>
                        <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                                backgroundColor: result.confidence === 'high' ? '#10b98120' : result.confidence === 'medium' ? '#f59e0b20' : '#ef444420',
                                color: result.confidence === 'high' ? '#10b981' : result.confidence === 'medium' ? '#f59e0b' : '#ef4444'
                            }}
                        >
                            {result.confidence} confidence
                        </span>
                    </div>

                    {/* Signals */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Signals Detected
                        </h3>
                        <div className="space-y-3">
                            {result.signals.map((signal, sidx) => (
                                <div key={sidx} className="flex items-start gap-3">
                                    {signal.detected ? (
                                        <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <Circle size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {signal.description}
                                        </p>
                                        {signal.detected && (
                                            <div className="mt-1">
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full transition-all"
                                                        style={{
                                                            width: `${signal.strength * 100}%`,
                                                            backgroundColor: 'var(--accent)'
                                                        }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                                    Strength: {(signal.strength * 100).toFixed(0)}%
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Observations */}
                    {result.observations.length > 0 && (
                        <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                <TrendingUp size={16} />
                                Observations
                            </h3>
                            <div className="space-y-2">
                                {result.observations.map((obs, oidx) => (
                                    <p key={oidx} className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                        {obs}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Pattern Recurrence */}
            {session.detectedPatterns.some(p => p.occurrences > 1) && (
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                        Pattern Recurrence
                    </h2>
                    <div className="space-y-3">
                        {session.detectedPatterns
                            .filter(p => p.occurrences > 1)
                            .map((pattern, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {pattern.description}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                            {pattern.name}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                                        {pattern.occurrences}x
                                    </span>
                                </div>
                            ))}
                    </div>
                    <p className="text-xs mt-4" style={{ color: 'var(--text-tertiary)' }}>
                        These patterns have appeared in your previous reflections.
                    </p>
                </div>
            )}

            {/* User Note */}
            <div className="card p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Add Your Note (Optional)
                </h2>
                <textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="What did you notice? Any insights or context..."
                    className="input-field resize-none"
                    rows={4}
                    maxLength={500}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    {userNote.length}/500 characters
                </p>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSaveToInsightLog}
                disabled={saving}
                className="btn-primary w-full"
            >
                {saving ? 'Saving...' : 'Save to Insight Log'}
            </button>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResultsContent />
        </Suspense>
    );
}
