'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createLog } from '@/lib/firebase/firestore';
import { LogFormData } from '@/lib/types/log';
import MetricInput from '@/components/log/MetricInput';
import ExposureInput from '@/components/log/ExposureInput';

export default function LogPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState<LogFormData>({
        date: new Date().toISOString().split('T')[0],
        sleep: '',
        workoutType: '',
        workoutDuration: '',
        meditation: '',
        learning: '',
        note: '',
    });
    const [metrics, setMetrics] = useState<Record<string, number>>({});
    const [exposures, setExposures] = useState<Record<string, number>>({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleMetricChange = (id: string, value: number) => {
        setMetrics(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleExposureChange = (id: string, value: number) => {
        setExposures(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setMessage('');

        try {
            const logData: any = {
                date: new Date(formData.date),
                metrics: metrics, // Save custom metrics
                exposures: exposures, // Save exposures
            };

            if (formData.sleep) logData.sleep = parseFloat(formData.sleep);
            if (formData.workoutType && formData.workoutDuration) {
                logData.workout = {
                    type: formData.workoutType,
                    duration: parseInt(formData.workoutDuration),
                };
            }
            if (formData.meditation) logData.meditation = parseInt(formData.meditation);
            if (formData.learning) logData.learning = parseInt(formData.learning);
            if (formData.note) logData.note = formData.note;

            await createLog(user.userId, logData);

            setMessage(`Log saved for ${formData.date}`);

            // Reset form
            setFormData({
                date: new Date().toISOString().split('T')[0],
                sleep: '',
                workoutType: '',
                workoutDuration: '',
                meditation: '',
                learning: '',
                note: '',
            });
            setMetrics({});
            setExposures({});
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Log Activity
            </h1>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                Record your daily observations. All fields are optional.
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

                {/* Sleep */}
                <div>
                    <label htmlFor="sleep" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Sleep (hours)
                    </label>
                    <input
                        id="sleep"
                        type="number"
                        name="sleep"
                        step="0.5"
                        min="0"
                        max="24"
                        value={formData.sleep}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., 7.5"
                    />
                </div>

                {/* Workout */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="workoutType" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Workout Type
                        </label>
                        <input
                            id="workoutType"
                            type="text"
                            name="workoutType"
                            value={formData.workoutType}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., Running, Yoga"
                        />
                    </div>
                    <div>
                        <label htmlFor="workoutDuration" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Workout Duration (minutes)
                        </label>
                        <input
                            id="workoutDuration"
                            type="number"
                            name="workoutDuration"
                            min="0"
                            value={formData.workoutDuration}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., 30"
                        />
                    </div>
                </div>

                {/* Meditation */}
                <div>
                    <label htmlFor="meditation" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Meditation (minutes)
                    </label>
                    <input
                        id="meditation"
                        type="number"
                        name="meditation"
                        min="0"
                        value={formData.meditation}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., 15"
                    />
                </div>

                {/* Learning */}
                <div>
                    <label htmlFor="learning" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Learning Time (minutes)
                    </label>
                    <input
                        id="learning"
                        type="number"
                        name="learning"
                        min="0"
                        value={formData.learning}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., 60"
                    />
                </div>

                {/* Custom Metrics */}
                {user?.metrics && user.metrics.length > 0 && (
                    <div className="pt-4 border-t border-[var(--border)]">
                        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>My States</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {user.metrics.map(metric => (
                                <MetricInput
                                    key={metric.id}
                                    label={metric.label}
                                    max={metric.max}
                                    value={metrics[metric.id] || 0}
                                    onChange={(val) => handleMetricChange(metric.id, val)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Exposures */}
                {user?.exposures && user.exposures.length > 0 && (
                    <div className="pt-4 border-t border-[var(--border)]">
                        <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Exposures</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {user.exposures.map(exp => (
                                <ExposureInput
                                    key={exp.id}
                                    label={exp.label}
                                    type={exp.type}
                                    value={exposures[exp.id] || 0}
                                    onChange={(val) => handleExposureChange(exp.id, val)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Note */}
                <div>
                    <label htmlFor="note" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Note (optional)
                    </label>
                    <textarea
                        id="note"
                        name="note"
                        rows={4}
                        value={formData.note}
                        onChange={handleChange}
                        className="input-field resize-none"
                        placeholder="Any observations or context..."
                    />
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
