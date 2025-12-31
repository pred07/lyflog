'use client';

import { useState, useEffect } from 'react';
import { HabitConfig, HabitEntry } from '@/lib/types/habit';
import { format } from 'date-fns';
import { Check, X as XIcon, ChevronLeft, FileText } from 'lucide-react';

interface DayHabitEditorProps {
    date: Date;
    habits: HabitConfig[];
    entries: HabitEntry[];
    onToggle: (habitId: string, done: boolean, note?: string) => void;
    onClose: () => void;
}

export default function DayHabitEditor({ date, habits, entries, onToggle, onClose }: DayHabitEditorProps) {
    const [habitStates, setHabitStates] = useState<Record<string, boolean>>({});
    const [habitNotes, setHabitNotes] = useState<Record<string, string>>({});
    const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const states: Record<string, boolean> = {};
        const notes: Record<string, string> = {};
        entries.forEach(entry => {
            states[entry.habitId] = entry.done;
            notes[entry.habitId] = entry.notes || '';
        });
        setHabitStates(states);
        setHabitNotes(notes);
    }, [entries]);

    const handleToggle = (habitId: string) => {
        const newState = !habitStates[habitId];
        setHabitStates(prev => ({ ...prev, [habitId]: newState }));
        // Note: we're not passing the note here, handleSaveNote handles that separately
        onToggle(habitId, newState, habitNotes[habitId]);
    };

    const handleNoteChange = (habitId: string, note: string) => {
        setHabitNotes(prev => ({ ...prev, [habitId]: note }));
    };

    const handleSaveNote = (habitId: string) => {
        onToggle(habitId, habitStates[habitId], habitNotes[habitId]);
        setExpandedNotes(prev => ({ ...prev, [habitId]: false }));
    };

    const toggleNoteInput = (habitId: string) => {
        setExpandedNotes(prev => ({ ...prev, [habitId]: !prev[habitId] }));
    };

    // Group habits
    const grouped = habits.reduce((acc, habit) => {
        if (!acc[habit.group]) acc[habit.group] = [];
        acc[habit.group].push(habit);
        return acc;
    }, {} as Record<string, HabitConfig[]>);

    // Sort within groups
    Object.keys(grouped).forEach(group => {
        grouped[group].sort((a, b) => a.order - b.order);
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2"
                    >
                        <ChevronLeft size={20} />
                        Back
                    </button>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {format(date, 'EEEE, MMMM d')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Edit habits for this day
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {Object.entries(grouped).map(([group, groupHabits]) => (
                            <div key={group}>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    {group}
                                </h3>
                                <div className="space-y-3">
                                    {groupHabits.map(habit => {
                                        const isDone = habitStates[habit.id] || false;
                                        const note = habitNotes[habit.id] || '';
                                        const isExpanded = expandedNotes[habit.id];

                                        return (
                                            <div key={habit.id} className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <button
                                                        onClick={() => handleToggle(habit.id)}
                                                        className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${isDone
                                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400'
                                                            : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                            }`}
                                                    >
                                                        <div
                                                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isDone ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                                                                }`}
                                                        >
                                                            {isDone ? <Check size={16} className="text-white" /> : null}
                                                        </div>
                                                        <span className="flex-1 text-left font-medium">{habit.label}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => toggleNoteInput(habit.id)}
                                                        className={`p-3 rounded-lg border-2 transition-all ${isExpanded || note
                                                            ? 'border-indigo-200 bg-indigo-50 text-indigo-500'
                                                            : 'border-gray-200 text-gray-400 hover:border-gray-300'
                                                            }`}
                                                        title="Add Note"
                                                    >
                                                        <FileText size={20} />
                                                    </button>
                                                </div>

                                                {(isExpanded || note) && (
                                                    <div className="pl-12 pr-2">
                                                        <textarea
                                                            value={note}
                                                            onChange={(e) => handleNoteChange(habit.id, e.target.value)}
                                                            onBlur={() => handleSaveNote(habit.id)}
                                                            placeholder="Add context..."
                                                            className="w-full text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                                            rows={2}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="w-full btn-primary">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
