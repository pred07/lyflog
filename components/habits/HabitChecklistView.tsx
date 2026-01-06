'use client';

import { HabitConfig } from '@/lib/types/habit';
import { Check, X, MoreVertical, Trash2, Plus, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface HabitChecklistViewProps {
    habits: HabitConfig[];
    habitStates: Record<string, boolean>;
    onToggle: (habitId: string) => void;
    onAdd?: (group: string) => void;
    onEdit?: (habit: HabitConfig) => void;
    onDelete?: (habitId: string) => void;
}

export default function HabitChecklistView({ habits, habitStates, onToggle, onAdd, onEdit, onDelete }: HabitChecklistViewProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState('');

    const handleStartEdit = (habit: HabitConfig) => {
        setEditingId(habit.id);
        setEditLabel(habit.label);
    };

    const handleSaveEdit = (habit: HabitConfig) => {
        if (onEdit && editLabel.trim()) {
            onEdit({ ...habit, label: editLabel.trim() });
        }
        setEditingId(null);
    };

    const handleDelete = (habitId: string) => {
        if (onDelete && confirm('Delete this habit?')) {
            onDelete(habitId);
        }
    };

    // Group habits
    const grouped = habits.reduce((acc, habit) => {
        if (!acc[habit.group]) acc[habit.group] = [];
        acc[habit.group].push(habit);
        return acc;
    }, {} as Record<string, HabitConfig[]>);

    // Sort within groups by order
    Object.keys(grouped).forEach(group => {
        grouped[group].sort((a, b) => a.order - b.order);
    });

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([group, groupHabits]) => (
                <div key={group} className="relative">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{group}</h3>
                        {onAdd && (
                            <button
                                onClick={() => onAdd(group)}
                                className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
                                title={`Add habit to ${group}`}
                            >
                                <Plus size={16} />
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {groupHabits.map(habit => {
                            const isDone = habitStates[habit.id] || false;
                            return (
                                <div
                                    key={habit.id}
                                    className={`group relative flex items-center p-3 rounded-lg border-2 transition-all ${isDone
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                        : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    {editingId === habit.id ? (
                                        <div className="flex-1 flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editLabel}
                                                onChange={(e) => setEditLabel(e.target.value)}
                                                className="flex-1 bg-white dark:bg-gray-800 border border-indigo-500 rounded px-2 py-1 outline-none text-sm"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveEdit(habit);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                            />
                                            <button
                                                onClick={() => handleSaveEdit(habit)}
                                                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(habit.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => onToggle(habit.id)}
                                                className="flex-1 flex items-center gap-3 text-left"
                                            >
                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isDone ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                                                    }`}>
                                                    {isDone ? <Check size={16} className="text-white" /> : null}
                                                </div>
                                                <span className={`flex-1 font-medium ${isDone ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                                    {habit.label}
                                                </span>
                                            </button>

                                            {/* Inline Edit Trigger */}
                                            {onEdit && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStartEdit(habit);
                                                    }}
                                                    className="ml-2 p-1.5 text-gray-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Edit Habit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
