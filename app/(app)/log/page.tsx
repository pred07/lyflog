'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createLog } from '@/lib/firebase/firestore';
import { LogFormData } from '@/lib/types/log';

export default function LogPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState<LogFormData>({
        date: new Date().toISOString().split('T')[0],
        workoutDone: 'false',
        workoutDuration: '',
        mood: '3',
        energy: '3',
        stress: '3',
        note: '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            workoutDone: e.target.checked ? 'true' : 'false',
            // Clear duration if unchecked
            workoutDuration: e.target.checked ? formData.workoutDuration : '',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setMessage('');

        try {
            const logData: any = {
                date: new Date(formData.date),
                workoutDone: formData.workoutDone === 'true',
                mood: parseInt(formData.mood),
                energy: parseInt(formData.energy),
                stress: parseInt(formData.stress),
            };

            if (formData.workoutDuration) {
                logData.workoutDuration = parseInt(formData.workoutDuration);
            }
            if (formData.note) {
                logData.note = formData.note;
            }

            await createLog(user.userId, logData);

            setMessage(`Log saved for ${formData.date}`);

            // Reset form
            setFormData({
                date: new Date().toISOString().split('T')[0],
                workoutDone: 'false',
                workoutDuration: '',
                mood: '3',
                energy: '3',
                stress: '3',
                note: '',
            });
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const workoutChecked = formData.workoutDone === 'true';

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Daily Log
            </h1>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                Track your daily activity and subjective states. All fields optional except date.
            </p>

            <form onSubmit={handleSubmit} className="card space-y-6">
                {/* Date */}
                <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Date
                    </label>
                    <input
                        id="date"
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="input-field"
                        required
                    />
                </div>

                {/* Workout Section */}
                <div className="pt-4 border-t border-[var(--border)]">
                    <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
                        Physical Activity
                    </h3>

                    <div className="flex items-center mb-4">
                        <input
                            id="workoutDone"
                            type="checkbox"
                            checked={workoutChecked}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="workoutDone" className="ml-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            Workout completed today
                        </label>
                    </div>

                    {workoutChecked && (
                        <div>
                            <label htmlFor="workoutDuration" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Duration (minutes)
                            </label>
                            <input
                                id="workoutDuration"
                                type="number"
                                name="workoutDuration"
                                min="1"
                                max="300"
                                value={formData.workoutDuration}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., 30"
                            />
                        </div>
                    )}
                </div>

                {/* Subjective States */}
                <div className="pt-4 border-t border-[var(--border)]">
                    <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
                        Subjective States (1-5 scale)
                    </h3>

                    <div className="space-y-6">
                        {/* Mood */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label htmlFor="mood" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    Mood
                                </label>
                                <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                                    {formData.mood}
                                </span>
                            </div>
                            <input
                                id="mood"
                                type="range"
                                name="mood"
                                min="1"
                                max="5"
                                value={formData.mood}
                                onChange={handleChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                <span>Low</span>
                                <span>High</span>
                            </div>
                        </div>

                        {/* Energy */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label htmlFor="energy" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    Energy
                                </label>
                                <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                                    {formData.energy}
                                </span>
                            </div>
                            <input
                                id="energy"
                                type="range"
                                name="energy"
                                min="1"
                                max="5"
                                value={formData.energy}
                                onChange={handleChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                <span>Low</span>
                                <span>High</span>
                            </div>
                        </div>

                        {/* Stress */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label htmlFor="stress" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    Stress
                                </label>
                                <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                                    {formData.stress}
                                </span>
                            </div>
                            <input
                                id="stress"
                                type="range"
                                name="stress"
                                min="1"
                                max="5"
                                value={formData.stress}
                                onChange={handleChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                <span>Low</span>
                                <span>High</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Note */}
                <div>
                    <label htmlFor="note" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Note (optional)
                    </label>
                    <textarea
                        id="note"
                        name="note"
                        rows={2}
                        value={formData.note}
                        onChange={handleChange}
                        className="input-field resize-none"
                        placeholder="Any observations or context..."
                        maxLength={200}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        {formData.note.length}/200 characters
                    </p>
                </div>

                {message && (
                    <div className="p-3 rounded" style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border)'
                    }}>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
                    </div>
                )}

                <button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Log'}
                </button>
            </form>
        </div>
    );
}
