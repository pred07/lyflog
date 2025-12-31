'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { SessionExercise, SessionEntry } from '@/lib/types/session';
import { addSessionEntry, getExerciseHistory, getDemoSessionEntries } from '@/lib/firebase/session';
import SessionBuilder from '@/components/session/SessionBuilder';
import { Save, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function SessionPage() {
    const { user } = useAuth();
    const [sessionType, setSessionType] = useState('');
    const [exercises, setExercises] = useState<SessionExercise[]>([]);
    const [exerciseHistory, setExerciseHistory] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            if (user.userId.startsWith('test_')) {
                const demoExercises = ['Bench Press', 'Squat', 'Deadlift', 'Pull-ups', 'Overhead Press'];
                setExerciseHistory(demoExercises);
            } else {
                const history = await getExerciseHistory(user.userId);
                setExerciseHistory(history);
            }
        };

        loadData();
    }, [user]);

    const handleSave = async () => {
        if (!user || !sessionType.trim() || exercises.length === 0) return;

        setSaving(true);
        setSaved(false);
        try {
            const newEntry: Omit<SessionEntry, 'id'> = {
                userId: user.userId,
                date: new Date(sessionDate),
                sessionType: sessionType.trim(),
                exercises,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await addSessionEntry(user.userId, newEntry);

            // Show success
            setSaved(true);

            // Reset form after short delay
            setTimeout(() => {
                setSessionType('');
                setExercises([]);
                setSessionDate(new Date().toISOString().split('T')[0]);
                setSaved(false);
            }, 1500);
        } catch (error) {
            console.error('Failed to save session:', error);
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    const hasData = sessionType.trim() || exercises.length > 0;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Session</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Log your workout or study session live.</p>
            </header>

            {/* Active Session Card */}
            <div className="card p-6 border-2 border-indigo-500/30">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Session Type
                        </label>
                        <input
                            type="text"
                            value={sessionType}
                            onChange={e => setSessionType(e.target.value)}
                            placeholder="e.g., Chest & Triceps, Math Study"
                            className="input-field text-lg font-semibold"
                        />
                    </div>
                    <div className="ml-4">
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            <Calendar size={14} className="inline mr-1" />
                            Date
                        </label>
                        <input
                            type="date"
                            value={sessionDate}
                            onChange={e => setSessionDate(e.target.value)}
                            className="input-field"
                        />
                    </div>
                </div>

                <SessionBuilder
                    sessionType={sessionType}
                    exercises={exercises}
                    onUpdateExercises={setExercises}
                    exerciseHistory={exerciseHistory}
                />

                {hasData && (
                    <button
                        onClick={handleSave}
                        disabled={saving || !sessionType.trim() || saved}
                        className={`w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${saved
                                ? 'bg-green-500 text-white'
                                : 'btn-primary'
                            }`}
                    >
                        {saved ? (
                            <>
                                <CheckCircle size={20} />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                {saving ? 'Saving...' : 'Save Session'}
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Guideline */}
            <div className="mt-6 px-4 py-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg text-xs text-gray-500 border border-gray-100 dark:border-gray-800">
                💡 This is your <strong>live notebook</strong>. No charts, no comparisons—just recording what happens.
            </div>
        </div>
    );
}
