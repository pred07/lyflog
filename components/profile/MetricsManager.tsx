'use client';

import { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { MetricConfig } from '@/lib/types/auth';

interface MetricsManagerProps {
    metrics: MetricConfig[];
    onUpdate: (metrics: MetricConfig[]) => void;
}

export default function MetricsManager({ metrics = [], onUpdate }: MetricsManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState('');

    const handleAdd = () => {
        if (!newLabel.trim()) return;

        const newMetric: MetricConfig = {
            id: `m_${Date.now()}`,
            label: newLabel.trim(),
            type: 'range',
            max: 5
        };

        onUpdate([...metrics, newMetric]);
        setNewLabel('');
        setIsAdding(false);
    };

    const handleRemove = (id: string) => {
        if (confirm('Stop tracking this metric? Past data will remain.')) {
            onUpdate(metrics.filter(m => m.id !== id));
        }
    };

    return (
        <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 flex justify-between items-center" style={{ color: 'var(--text-primary)' }}>
                <span>My States</span>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    {isAdding ? <X size={20} /> : <Plus size={20} />}
                </button>
            </h2>

            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Track internal states like Anxiety, Focus, or Energy.
            </p>

            {/* List */}
            <div className="space-y-3">
                {metrics.map(metric => (
                    <div key={metric.id} className="flex justify-between items-center p-3 rounded bg-gray-50 dark:bg-gray-800/50">
                        <span className="font-medium">{metric.label}</span>
                        <button
                            onClick={() => handleRemove(metric.id)}
                            className="text-red-400 hover:text-red-500 p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                {metrics.length === 0 && !isAdding && (
                    <div className="text-center py-4 text-sm text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        No custom states yet.
                    </div>
                )}
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="mt-4 flex gap-2 animate-in fade-in slide-in-from-top-2">
                    <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="e.g. Anxiety, Focus..."
                        className="input-field py-2"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        className="btn-primary py-2 px-4"
                    >
                        Add
                    </button>
                </div>
            )}
        </div>
    );
}
