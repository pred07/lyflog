'use client';

import { LogbookConfig, LogbookEntry } from '@/lib/types/logbook';
import { format } from 'date-fns';
import { Check, Edit2, Trash2, X, Save } from 'lucide-react';
import { useState } from 'react';

interface LogbookViewProps {
    logbook: LogbookConfig;
    entries: LogbookEntry[];
    onUpdate?: (entryId: string, data: Record<string, any>) => void;
    onDelete?: (entryId: string) => void;
}

export default function LogbookView({ logbook, entries, onUpdate, onDelete }: LogbookViewProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Record<string, any>>({});

    const handleStartEdit = (entry: LogbookEntry) => {
        setEditingId(entry.id);
        setEditData(entry.data);
    };

    const handleSaveEdit = (entryId: string) => {
        if (onUpdate) {
            onUpdate(entryId, editData);
        }
        setEditingId(null);
        setEditData({});
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleDelete = (entryId: string) => {
        if (onDelete && confirm('Delete this entry?')) {
            onDelete(entryId);
        }
    };

    if (entries.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p>No entries yet.</p>
            </div>
        );
    }

    return (
        <div className="-mx-4 sm:mx-0">
            <div className="overflow-x-auto border-y sm:border sm:border-[var(--border)] sm:rounded-lg">
                <table className="w-full text-sm text-left min-w-[600px]">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-medium border-b border-[var(--border)]">
                        <tr>
                            <th className="p-2 sm:p-3 w-20 sm:w-24 sticky left-0 bg-gray-50 dark:bg-gray-900/50 z-10">Date</th>
                            {logbook.columns.map(col => (
                                <th key={col.id} className="p-2 sm:p-3 min-w-[100px] whitespace-nowrap">{col.label}</th>
                            ))}
                            {(onUpdate || onDelete) && (
                                <th className="p-2 sm:p-3 w-20">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-white dark:bg-gray-950">
                        {entries.map(entry => {
                            const isEditing = editingId === entry.id;

                            return (
                                <tr key={entry.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                                    <td className="p-2 sm:p-3 font-mono text-xs text-gray-400 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-950 z-10">
                                        {format(entry.date, 'MMM dd')}
                                    </td>
                                    {logbook.columns.map(col => {
                                        const val = isEditing ? editData[col.id] : entry.data[col.id];

                                        return (
                                            <td key={col.id} className="p-2 sm:p-3">
                                                {isEditing ? (
                                                    col.type === 'checkbox' ? (
                                                        <input
                                                            type="checkbox"
                                                            checked={!!val}
                                                            onChange={(e) => setEditData({ ...editData, [col.id]: e.target.checked })}
                                                            className="w-4 h-4"
                                                        />
                                                    ) : (
                                                        <input
                                                            type={col.type === 'number' ? 'number' : 'text'}
                                                            value={val || ''}
                                                            onChange={(e) => setEditData({ ...editData, [col.id]: col.type === 'number' ? Number(e.target.value) : e.target.value })}
                                                            className="input-field text-sm py-1 px-2 w-full"
                                                        />
                                                    )
                                                ) : (
                                                    col.type === 'checkbox' ? (
                                                        val ? <Check size={16} className="text-green-500" /> : <span className="text-gray-300">-</span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-primary)' }} className="text-sm">{val?.toString() || '-'}</span>
                                                    )
                                                )}
                                            </td>
                                        );
                                    })}
                                    {(onUpdate || onDelete) && (
                                        <td className="p-2 sm:p-3">
                                            {isEditing ? (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleSaveEdit(entry.id)}
                                                        className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                                        title="Save"
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                                        title="Cancel"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-1">
                                                    {onUpdate && (
                                                        <button
                                                            onClick={() => handleStartEdit(entry)}
                                                            className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => handleDelete(entry.id)}
                                                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile scroll hint */}
            <p className="sm:hidden text-xs text-center text-gray-400 mt-2">← Swipe to see all columns →</p>
        </div>
    );
}
