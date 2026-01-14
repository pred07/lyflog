'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import {
    MoodFocus,
    PerceivedReason,
    MOOD_FOCUS_LABELS,
    PERCEIVED_REASON_LABELS
} from '@/lib/types/reflection';
import { Brain, AlertCircle } from 'lucide-react';

export default function ReflectPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [moodFocus, setMoodFocus] = useState<MoodFocus | null>(null);
    const [perceivedReasons, setPerceivedReasons] = useState<PerceivedReason[]>([]);
    const [timeWindow, setTimeWindow] = useState<number>(14);
    const [analyzing, setAnalyzing] = useState(false);

    const handleReasonToggle = (reason: PerceivedReason) => {
        if (perceivedReasons.includes(reason)) {
            setPerceivedReasons(perceivedReasons.filter(r => r !== reason));
        } else {
            setPerceivedReasons([...perceivedReasons, reason]);
        }
    };

    const handleAnalyze = async () => {
        if (!moodFocus || perceivedReasons.length === 0) {
            alert('Please select a mood focus and at least one perceived reason');
            return;
        }

        setAnalyzing(true);

        // Navigate to results page with selections
        const params = new URLSearchParams({
            moodFocus,
            reasons: perceivedReasons.join(','),
            timeWindow: timeWindow.toString()
        });

        router.push(`/reflect/results?${params.toString()}`);
    };

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Brain size={32} className="text-purple-500" />
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Self-Reflection
                    </h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Optional: Explore your patterns through a specific lens
                </p>
            </div>

            {/* Important Note */}
            <div className="card p-4 mb-6" style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)'
            }}>
                <div className="flex gap-3">
                    <AlertCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                            This is a mirror, not a diagnosis
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            This tool reflects patterns in your data through the lens you choose.
                            It does not diagnose, prescribe, or make medical claims.
                            All interpretation is user-initiated.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Mood Focus Selection */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                        How are you feeling right now?
                    </h2>
                    <div className="space-y-2">
                        {(Object.keys(MOOD_FOCUS_LABELS) as MoodFocus[]).map((mood) => (
                            <label
                                key={mood}
                                className="flex items-center p-3 rounded cursor-pointer transition-colors"
                                style={{
                                    backgroundColor: moodFocus === mood ? 'var(--bg-tertiary)' : 'transparent',
                                    border: `1px solid ${moodFocus === mood ? 'var(--accent)' : 'var(--border)'}`
                                }}
                            >
                                <input
                                    type="radio"
                                    name="moodFocus"
                                    value={mood}
                                    checked={moodFocus === mood}
                                    onChange={() => setMoodFocus(mood)}
                                    className="mr-3"
                                />
                                <span style={{ color: 'var(--text-primary)' }}>
                                    {MOOD_FOCUS_LABELS[mood]}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Perceived Reasons Selection */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        What might be contributing?
                    </h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        Select one or more (these are descriptors, not conditions)
                    </p>
                    <div className="space-y-2">
                        {(Object.keys(PERCEIVED_REASON_LABELS) as PerceivedReason[]).map((reason) => (
                            <label
                                key={reason}
                                className="flex items-center p-3 rounded cursor-pointer transition-colors"
                                style={{
                                    backgroundColor: perceivedReasons.includes(reason) ? 'var(--bg-tertiary)' : 'transparent',
                                    border: `1px solid ${perceivedReasons.includes(reason) ? 'var(--accent)' : 'var(--border)'}`
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={perceivedReasons.includes(reason)}
                                    onChange={() => handleReasonToggle(reason)}
                                    className="mr-3"
                                />
                                <span style={{ color: 'var(--text-primary)' }}>
                                    {PERCEIVED_REASON_LABELS[reason]}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Time Window Selection */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                        Time window
                    </h2>
                    <div className="space-y-2">
                        {[7, 14, 30].map((days) => (
                            <label
                                key={days}
                                className="flex items-center p-3 rounded cursor-pointer transition-colors"
                                style={{
                                    backgroundColor: timeWindow === days ? 'var(--bg-tertiary)' : 'transparent',
                                    border: `1px solid ${timeWindow === days ? 'var(--accent)' : 'var(--border)'}`
                                }}
                            >
                                <input
                                    type="radio"
                                    name="timeWindow"
                                    value={days}
                                    checked={timeWindow === days}
                                    onChange={() => setTimeWindow(days)}
                                    className="mr-3"
                                />
                                <span style={{ color: 'var(--text-primary)' }}>
                                    Last {days} days
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Analyze Button */}
                <button
                    onClick={handleAnalyze}
                    disabled={!moodFocus || perceivedReasons.length === 0 || analyzing}
                    className="btn-primary w-full"
                >
                    {analyzing ? 'Analyzing...' : 'Analyze Patterns'}
                </button>
            </div>
        </div>
    );
}
