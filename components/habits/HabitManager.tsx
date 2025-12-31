'use client';

import { useState } from 'react';
import { HabitConfig } from '@/lib/types/habit';
import { Plus, Trash2, GripVertical, X } from 'lucide-react';

interface HabitManagerProps {
    habits: HabitConfig[];
    onUpdate: (habits: HabitConfig[]) => void;
    onClose: () => void;
}

export default function HabitManager({ habits, onUpdate, onClose }: HabitManagerProps) {
    const [newHabitLabel, setNewHabitLabel] = useState('');
    const [newHabitGroup, setNewHabitGroup] = useState('');

    // Get unique groups
    const groups = Array.from(new Set(habits.map(h => h.group)));

    const handleAddHabit = () => {
        if (!newHabitLabel.trim()) return;

        const group = newHabitGroup.trim() || 'General';
        const maxOrder = habits.filter(h => h.group === group).reduce((max, h) => Math.max(max, h.order), 0);

        const newHabit: HabitConfig = {
            id: `habit_${Date.now()}`,
            label: newHabitLabel.trim(),
            group,
            order: maxOrder + 1
        };

        onUpdate([...habits, newHabit]);
        setNewHabitLabel('');
        setNewHabitGroup('');
    };

    const handleDeleteHabit = (habitId: string) => {
        if (confirm('Delete this habit? Past entries will remain.')) {
            onUpdate(habits.filter(h => h.id !== habitId));
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddHabit();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Manage Habits
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Add New Habit */}
                    <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <h3 className="text-sm font-semibold mb-3 text-indigo-900 dark:text-indigo-300">
                            Add New Habit
                        </h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={newHabitLabel}
                                onChange={e => setNewHabitLabel(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Habit name (e.g., Cold Shower)"
                                className="input-field w-full"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newHabitGroup}
                                    onChange={e => setNewHabitGroup(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Group (e.g., Morning Routine)"
                                    list="habit-groups"
                                    className="input-field flex-1"
                                />
                                <datalist id="habit-groups">
                                    {groups.map(group => (
                                        <option key={group} value={group} />
                                    ))}
                                </datalist>
                                <button
                                    onClick={handleAddHabit}
                                    disabled={!newHabitLabel.trim()}
                                    className="btn-primary flex items-center gap-2 px-4"
                                >
                                    <Plus size={16} />
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Existing Habits */}
                    <div className="space-y-4">
                        {groups.map(group => {
                            const groupHabits = habits.filter(h => h.group === group).sort((a, b) => a.order - b.order);

                            return (
                                <div key={group}>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        {group}
                                    </h3>
                                    <div className="space-y-2">
                                        {groupHabits.map(habit => (
                                            <div
                                                key={habit.id}
                                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                                            >
                                                <GripVertical size={16} className="text-gray-400 cursor-move" />
                                                <span className="flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {habit.label}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteHabit(habit.id)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 transition-colors"
                                                    title="Delete habit"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {habits.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            No habits yet. Add your first one above!
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        onClick={onClose}
                        className="w-full btn-primary"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
