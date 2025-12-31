'use client';

import { HabitConfig, HabitEntry } from '@/lib/types/habit';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { Check, X } from 'lucide-react';

interface HabitCalendarGridProps {
    weekStart: Date;
    habits: HabitConfig[];
    entries: HabitEntry[];
    onDateClick: (date: Date) => void;
}

export default function HabitCalendarGrid({ weekStart, habits, entries, onDateClick }: HabitCalendarGridProps) {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const getEntriesForDate = (date: Date) => {
        return entries.filter(entry => isSameDay(entry.date, date));
    };

    const getCompletionStats = (date: Date) => {
        const dayEntries = getEntriesForDate(date);
        const completed = dayEntries.filter(e => e.done).length;
        const total = habits.length;
        return { completed, total };
    };

    return (
        <div className="grid grid-cols-7 gap-2">
            {days.map(day => {
                const stats = getCompletionStats(day);
                const isCurrentDay = isToday(day);
                const dayEntries = getEntriesForDate(day);

                return (
                    <button
                        key={day.toISOString()}
                        onClick={() => onDateClick(day)}
                        className={`p-3 rounded-lg border-2 transition-all hover:border-indigo-400 ${isCurrentDay
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50'
                            }`}
                    >
                        {/* Day Header */}
                        <div className="text-center mb-2">
                            <div className="text-xs text-gray-500 uppercase">
                                {format(day, 'EEE')}
                            </div>
                            <div className={`text-lg font-bold ${isCurrentDay ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                {format(day, 'd')}
                            </div>
                        </div>

                        {/* Completion Indicators */}
                        <div className="space-y-1">
                            {habits.slice(0, 3).map(habit => {
                                const entry = dayEntries.find(e => e.habitId === habit.id);
                                const isDone = entry?.done || false;

                                return (
                                    <div
                                        key={habit.id}
                                        className={`w-full h-1.5 rounded-full ${isDone
                                                ? 'bg-green-500'
                                                : 'bg-gray-200 dark:bg-gray-700'
                                            }`}
                                    />
                                );
                            })}
                            {habits.length > 3 && (
                                <div className="text-xs text-gray-400 text-center mt-1">
                                    +{habits.length - 3}
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="text-xs text-gray-500 text-center mt-2">
                            {stats.completed}/{stats.total}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
