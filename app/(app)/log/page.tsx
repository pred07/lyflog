'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createLog } from '@/lib/firebase/firestore';
import { LogFormData } from '@/lib/types/log';
import MetricInput from '@/components/log/MetricInput';
import ExposureInput from '@/components/log/ExposureInput';
import TagInput from '@/components/shared/TagInput';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { parseNaturalLanguageLog } from '@/lib/analysis/parser';
import { Mic, MicOff, Loader } from 'lucide-react';

export default function LogPage() {
    const { user } = useAuth();
    const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceInput();
    const [isProcessingVoice, setIsProcessingVoice] = useState(false);

    // Auto-process transcript when listening stops
    useEffect(() => {
        if (!isListening && transcript) {
            handleVoiceProcess(transcript);
        }
    }, [isListening, transcript]);

    const handleVoiceProcess = (text: string) => {
        setIsProcessingVoice(true);
        const { updates, matchedKeys } = parseNaturalLanguageLog(text);

        // Merge updates into form state
        setFormData(prev => ({
            ...prev,
            sleep: updates.sleep ? updates.sleep.toString() : prev.sleep,
            meditation: updates.meditation ? updates.meditation.toString() : prev.meditation,
            learning: updates.learning ? updates.learning.toString() : prev.learning,
            workoutDuration: updates.workout?.duration ? updates.workout.duration.toString() : prev.workoutDuration,
            // If workout detected, maybe default type if empty?
            workoutType: updates.workout && !prev.workoutType ? 'Workout' : prev.workoutType,
            // Append note
            note: prev.note ? prev.note + '\n' + text : text
        }));

        // Merge metrics
        if (updates.metrics) {
            setMetrics(prev => ({ ...prev, ...updates.metrics }));
        }

        // Merge tags
        if (updates.tags && updates.tags.length > 0) {
            // Safely handle potential undefined with fallback
            const newTags = updates.tags || [];
            setTags(prev => Array.from(new Set([...prev, ...newTags])));
        }

        setIsProcessingVoice(false);
    };

    const [formData, setFormData] = useState<LogFormData>({
        date: new Date().toISOString().split('T')[0],
        sleep: '',
        workoutType: '',
        workoutDuration: '',
        meditation: '',
        learning: '',
        steps: '',
        water: '',
        calories: '',
        uvIndex: '',
        heartRate: '',
        weight: '',
        note: '',
        tags: ''
    });

    // Separate state for tags array
    const [tags, setTags] = useState<string[]>([]);
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
                tags: tags, // Include tags in payload
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

            // New health metrics
            if (formData.steps) logData.steps = parseInt(formData.steps);
            if (formData.water) logData.water = parseFloat(formData.water);
            if (formData.calories) logData.calories = parseInt(formData.calories);
            if (formData.uvIndex) logData.uvIndex = parseFloat(formData.uvIndex);
            if (formData.heartRate) logData.heartRate = parseInt(formData.heartRate);
            if (formData.weight) logData.weight = parseFloat(formData.weight);

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
                steps: '',
                water: '',
                calories: '',
                uvIndex: '',
                heartRate: '',
                weight: '',
                note: '',
                tags: ''
            });
            setMetrics({});
            setExposures({});
            setTags([]); // Reset tags
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Log Activity
                </h1>

                {isSupported && (
                    <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        className={`p-3 rounded-full transition-all ${isListening
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20'
                            }`}
                        title="Voice Log"
                    >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                )}
            </div>
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
                        inputMode="decimal"
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
                            inputMode="numeric"
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
                        inputMode="numeric"
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
                        inputMode="numeric"
                        value={formData.learning}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., 60"
                    />
                </div>

                {/* Health Metrics Section */}
                <div className="pt-4 border-t border-[var(--border)]">
                    <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Health Metrics</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Steps */}
                        <div>
                            <label htmlFor="steps" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Steps
                            </label>
                            <input
                                id="steps"
                                type="number"
                                name="steps"
                                min="0"
                                inputMode="numeric"
                                value={formData.steps}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., 10000"
                            />
                        </div>

                        {/* Water */}
                        <div>
                            <label htmlFor="water" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Water (liters)
                            </label>
                            <input
                                id="water"
                                type="number"
                                name="water"
                                min="0"
                                step="0.1"
                                inputMode="decimal"
                                value={formData.water}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., 2.5"
                            />
                        </div>

                        {/* Calories */}
                        <div>
                            <label htmlFor="calories" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Calories
                            </label>
                            <input
                                id="calories"
                                type="number"
                                name="calories"
                                min="0"
                                inputMode="numeric"
                                value={formData.calories}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., 2000"
                            />
                        </div>

                        {/* UV Index */}
                        <div>
                            <label htmlFor="uvIndex" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                UV Index
                            </label>
                            <input
                                id="uvIndex"
                                type="number"
                                name="uvIndex"
                                min="0"
                                max="15"
                                step="0.1"
                                inputMode="decimal"
                                value={formData.uvIndex}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., 5"
                            />
                        </div>

                        {/* Heart Rate */}
                        <div>
                            <label htmlFor="heartRate" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Heart Rate (bpm)
                            </label>
                            <input
                                id="heartRate"
                                type="number"
                                name="heartRate"
                                min="0"
                                inputMode="numeric"
                                value={formData.heartRate}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., 65"
                            />
                        </div>

                        {/* Weight */}
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Weight (kg)
                            </label>
                            <input
                                id="weight"
                                type="number"
                                name="weight"
                                min="0"
                                step="0.1"
                                inputMode="decimal"
                                value={formData.weight}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., 70.5"
                            />
                        </div>
                    </div>
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
