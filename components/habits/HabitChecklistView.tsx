'use client';

import { HabitConfig } from '@/lib/types/habit';
import { Check, X } from 'lucide-react';

interface HabitChecklistViewProps {
    habits: HabitConfig[];
    habitStates: Record<string, boolean>;
    onToggle: (habitId: string) => void;
}

export default function HabitChecklistView({ habits, habitStates, onToggle }: HabitChecklistViewProps) {
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
                <div key={group}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{group}</h3>
                    <div className="space-y-2">
                        {groupHabits.map(habit => {
                            const isDone = habitStates[habit.id] || false;
                            return (
                                <button
                                    key={habit.id}
                                    onClick={() => onToggle(habit.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${isDone
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400'
                                            : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isDone ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                                        }`}>
                                        {isDone ? <Check size={16} className="text-white" /> : null}
                                    </div>
                                    <span className="flex-1 text-left font-medium">{habit.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
