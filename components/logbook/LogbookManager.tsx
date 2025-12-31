'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { LogbookConfig, LogbookColumn, LogbookColumnType } from '@/lib/types/logbook';

interface LogbookManagerProps {
    logbooks: LogbookConfig[];
    onUpdate: (logbooks: LogbookConfig[]) => void;
}

export default function LogbookManager({ logbooks, onUpdate }: LogbookManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingLogbookId, setEditingLogbookId] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [columns, setColumns] = useState<LogbookColumn[]>([]);

    const resetForm = () => {
        setTitle('');
        setColumns([]);
        setIsAdding(false);
        setEditingLogbookId(null);
    };

    const handleAddColumn = () => {
        const newCol: LogbookColumn = {
            id: crypto.randomUUID(),
            label: 'New Column',
            type: 'text',
        };
        setColumns([...columns, newCol]);
    };

    const handleUpdateColumn = (id: string, updates: Partial<LogbookColumn>) => {
        setColumns(columns.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const handleDeleteColumn = (id: string) => {
        setColumns(columns.filter(c => c.id !== id));
    };

    const handleSaveLogbook = () => {
        if (!title.trim()) return;

        const newLogbook: LogbookConfig = {
            id: editingLogbookId || crypto.randomUUID(),
            userId: '', // populated by parent/context if needed, or ignored in local config
            title,
            columns,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (editingLogbookId) {
            onUpdate(logbooks.map(l => l.id === editingLogbookId ? newLogbook : l));
        } else {
            onUpdate([...logbooks, newLogbook]);
        }
        resetForm();
    };

    const handleEditStart = (logbook: LogbookConfig) => {
        setEditingLogbookId(logbook.id);
        setTitle(logbook.title);
        setColumns(logbook.columns);
        setIsAdding(true);
    };

    const handleDeleteLogbook = (id: string) => {
        if (confirm('Delete this logbook? Data will remain but definition will be lost.')) {
            onUpdate(logbooks.filter(l => l.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Logbooks</h3>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn-secondary text-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> New Logbook
                    </button>
                )}
            </div>

            {isAdding ? (
                <div className="card p-4 border border-indigo-500/30">
                    <h4 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                        {editingLogbookId ? 'Edit Logbook' : 'Create Logbook'}
                    </h4>

                    {/* Title */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., Gym Training"
                            className="input-field"
                        />
                    </div>

                    {/* Columns */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Columns</label>
                            <button onClick={handleAddColumn} type="button" className="text-xs text-indigo-500 hover:text-indigo-400">
                                + Add Column
                            </button>
                        </div>

                        <div className="space-y-2">
                            {columns.map((col, index) => (
                                <div key={col.id} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={col.label}
                                        onChange={e => handleUpdateColumn(col.id, { label: e.target.value })}
                                        className="input-field text-sm py-1"
                                        placeholder="Col Name"
                                    />
                                    <select
                                        value={col.type}
                                        onChange={e => handleUpdateColumn(col.id, { type: e.target.value as LogbookColumnType })}
                                        className="input-field text-sm py-1 w-32"
                                    >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="checkbox">Checkbox</option>
                                        <option value="select">Select</option>
                                        <option value="notes">Notes</option>
                                    </select>
                                    <button onClick={() => handleDeleteColumn(col.id)} className="text-red-400 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {columns.length === 0 && (
                                <p className="text-sm italic text-gray-500">No columns defined.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button onClick={resetForm} className="btn-secondary text-sm">Cancel</button>
                        <button onClick={handleSaveLogbook} className="btn-primary text-sm">Save</button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {logbooks.map(lb => (
                        <div key={lb.id} className="card flex justify-between items-center p-3">
                            <div>
                                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{lb.title}</h4>
                                <p className="text-xs text-gray-500">{lb.columns.length} columns</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEditStart(lb)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-indigo-500">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDeleteLogbook(lb.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {logbooks.length === 0 && (
                        <div className="text-center py-6 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
                            <p className="text-sm">No logbooks yet.</p>
                            <p className="text-xs mt-1">Create one for complex activities like Gym or Study.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
