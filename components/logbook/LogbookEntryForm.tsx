'use client';

import { useState } from 'react';
import { LogbookConfig, LogbookEntry } from '@/lib/types/logbook';
import { X, Check } from 'lucide-react';

interface LogbookEntryFormProps {
    logbook: LogbookConfig;
    onSave: (data: Record<string, any>, date: Date) => Promise<void>;
    onCancel: () => void;
}

export default function LogbookEntryForm({ logbook, onSave, onCancel }: LogbookEntryFormProps) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);

    const handleChange = (colId: string, value: any) => {
        setFormData(prev => ({ ...prev, [colId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData, new Date(date));
            setFormData({}); // Reset? Or close.
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card border border-indigo-500/20 p-4 mb-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>New Entry</h3>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 mb-4">
                    {/* Date */}
                    <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>

                    {/* Dynamic Columns */}
                    {logbook.columns.map(col => (
                        <div key={col.id}>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                {col.label}
                            </label>

                            {col.type === 'text' && (
                                <input
                                    type="text"
                                    value={formData[col.id] || ''}
                                    onChange={e => handleChange(col.id, e.target.value)}
                                    className="input-field"
                                />
                            )}

                            {col.type === 'number' && (
                                <input
                                    type="number"
                                    value={formData[col.id] || ''}
                                    onChange={e => handleChange(col.id, parseFloat(e.target.value))}
                                    className="input-field"
                                />
                            )}

                            {col.type === 'checkbox' && (
                                <button
                                    type="button"
                                    onClick={() => handleChange(col.id, !formData[col.id])}
                                    className={`w-full p-2 rounded border flex items-center justify-center gap-2 transition-colors ${formData[col.id]
                                            ? 'bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400'
                                            : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400'
                                        }`}
                                >
                                    {formData[col.id] ? <Check size={16} /> : <X size={16} />}
                                    <span>{formData[col.id] ? 'Done' : 'Not Done'}</span>
                                </button>
                            )}

                            {col.type === 'select' && (
                                <select
                                    value={formData[col.id] || ''}
                                    onChange={e => handleChange(col.id, e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Select...</option>
                                    {col.options?.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            )}

                            {col.type === 'notes' && (
                                <textarea
                                    rows={2}
                                    value={formData[col.id] || ''}
                                    onChange={e => handleChange(col.id, e.target.value)}
                                    className="input-field resize-none"
                                />
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary flex justify-center items-center gap-2"
                >
                    {saving ? 'Saving...' : 'Add Entry'}
                </button>
            </form>
        </div>
    );
}
