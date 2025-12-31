'use client';

import { useState } from 'react';
import { Plus, X, Trash2, Zap, Coffee, Smartphone, Cigarette } from 'lucide-react';
import { ExposureConfig } from '@/lib/types/auth';

interface ExposureManagerProps {
    exposures: ExposureConfig[];
    onUpdate: (exposures: ExposureConfig[]) => void;
}

const PRESETS = [
    { label: 'Caffeine', type: 'count', icon: Coffee },
    { label: 'Alcohol', type: 'count', icon: Zap },
    { label: 'Screen Time', type: 'duration', icon: Smartphone },
    { label: 'Cigarettes', type: 'count', icon: Cigarette },
] as const;

export default function ExposureManager({ exposures = [], onUpdate }: ExposureManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [label, setLabel] = useState('');
    const [type, setType] = useState<'count' | 'duration'>('count');

    const handleAdd = (presetLabel?: string, presetType?: 'count' | 'duration') => {
        const finalLabel = presetLabel || label.trim();
        const finalType = presetType || type;

        if (!finalLabel) return;

        // Prevent duplicates
        if (exposures.some(e => e.label.toLowerCase() === finalLabel.toLowerCase())) {
            alert('Exposure already exists');
            return;
        }

        const newExposure: ExposureConfig = {
            id: `e_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            label: finalLabel,
            type: finalType,
        };

        onUpdate([...exposures, newExposure]);
        setLabel('');
        setIsAdding(false);
    };

    const handleRemove = (id: string) => {
        if (confirm('Stop tracking this exposure? Past data will remain.')) {
            onUpdate(exposures.filter(e => e.id !== id));
        }
    };

    return (
        <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 flex justify-between items-center" style={{ color: 'var(--text-primary)' }}>
                <span>Exposures</span>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    {isAdding ? <X size={20} /> : <Plus size={20} />}
                </button>
            </h2>

            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Track external inputs like Caffeine, Alcohol, or Screen Time.
            </p>

            {/* List */}
            <div className="space-y-3 mb-6">
                {exposures.map(exp => (
                    <div key={exp.id} className="flex justify-between items-center p-3 rounded bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{exp.label}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500">
                                {exp.type}
                            </span>
                        </div>
                        <button
                            onClick={() => handleRemove(exp.id)}
                            className="text-red-400 hover:text-red-500 p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                {exposures.length === 0 && !isAdding && (
                    <div className="text-center py-4 text-sm text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        No exposures tracked.
                    </div>
                )}
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    {/* Presets */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => handleAdd(preset.label, preset.type)}
                                className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                style={{ borderColor: 'var(--border)' }}
                            >
                                <preset.icon size={16} className="text-gray-500" />
                                <span className="text-sm">{preset.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-[#0f1115] px-2 text-gray-500">Or Custom</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="Name..."
                                className="input-field py-2 mb-2"
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                className="input-field py-2"
                            >
                                <option value="count">Count (e.g. cups)</option>
                                <option value="duration">Duration (mins)</option>
                            </select>
                        </div>
                        <button
                            onClick={() => handleAdd()}
                            className="btn-primary py-2 px-4 h-[78px]"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
