'use client';

import { HabitConfig, HabitEntry } from '@/lib/types/habit';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface HabitSpreadsheetCalendarProps {
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    habits: HabitConfig[];
    entries: HabitEntry[];
    onToggle: (habitId: string, date: Date, done: boolean) => void;
    onRename?: (habitId: string, newName: string) => void;
}

export default function HabitSpreadsheetCalendar({
    currentMonth,
    onMonthChange,
    habits,
    entries,
    onToggle,
    onRename
}: HabitSpreadsheetCalendarProps) {
    const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const startEditing = (habit: HabitConfig) => {
        if (!onRename) return;
        setEditingHabitId(habit.id);
        setEditValue(habit.label);
    };

    const handleSave = (habitId: string) => {
        if (editValue.trim() && onRename) {
            onRename(habitId, editValue.trim());
        }
        setEditingHabitId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, habitId: string) => {
        if (e.key === 'Enter') handleSave(habitId);
        if (e.key === 'Escape') setEditingHabitId(null);
    };

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getEntry = (habitId: string, date: Date) => {
        return entries.find(e => e.habitId === habitId && isSameDay(e.date, date));
    };

    const getDayCompletion = (date: Date) => {
        const dayEntries = entries.filter(e => isSameDay(e.date, date));
        const completed = dayEntries.filter(e => e.done).length;
        return habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
    };

    const getMonthCompletion = () => {
        let totalPossible = habits.length * days.length;
        let totalCompleted = 0;

        days.forEach(day => {
            habits.forEach(habit => {
                const entry = getEntry(habit.id, day);
                if (entry?.done) totalCompleted++;
            });
        });

        return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    };

    const isWeekend = (date: Date) => {
        const day = getDay(date);
        return day === 0 || day === 6; // Sunday or Saturday
    };

    const monthCompletion = getMonthCompletion();

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onMonthChange(subMonths(currentMonth, 1))}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => onMonthChange(addMonths(currentMonth, 1))}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Completion Graph Placeholder */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Monthly Completion</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{monthCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: `${monthCompletion}%` }}
                    />
                </div>
            </div>

            {/* Spreadsheet Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50">
                            <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-900/50 px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 border-b border-r border-gray-200 dark:border-gray-800 min-w-[150px]">
                                Habit
                            </th>
                            {days.map(day => (
                                <th
                                    key={day.toISOString()}
                                    className={`px-2 py-2 text-center text-xs font-semibold border-b border-r border-gray-200 dark:border-gray-800 min-w-[40px] ${isWeekend(day)
                                        ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    <div>{format(day, 'EEE')}</div>
                                    <div className="font-bold">{format(day, 'd')}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {habits.map((habit, habitIndex) => (
                            <tr key={habit.id} className={habitIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}>
                                <td className="sticky left-0 z-10 px-4 py-3 text-sm font-medium border-b border-r border-gray-200 dark:border-gray-800 bg-inherit">
                                    {editingHabitId === habit.id ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => handleSave(habit.id)}
                                            onKeyDown={(e) => handleKeyDown(e, habit.id)}
                                            autoFocus
                                            className="w-full bg-white dark:bg-gray-800 border-2 border-indigo-500 rounded px-1 py-0.5 outline-none"
                                            style={{ color: 'var(--text-primary)' }}
                                        />
                                    ) : (
                                        <div
                                            onClick={() => startEditing(habit)}
                                            className={onRename ? "cursor-pointer hover:text-indigo-500 transition-colors" : ""}
                                            style={{ color: 'var(--text-primary)' }}
                                            title={onRename ? "Click to rename" : ""}
                                        >
                                            {habit.label}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-400">{habit.group}</div>
                                </td>
                                {days.map(day => {
                                    const entry = getEntry(habit.id, day);
                                    const isDone = entry?.done || false;

                                    return (
                                        <td
                                            key={day.toISOString()}
                                            className={`px-2 py-3 text-center border-b border-r border-gray-200 dark:border-gray-800 ${isWeekend(day) ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''
                                                }`}
                                        >
                                            <button
                                                onClick={() => onToggle(habit.id, day, !isDone)}
                                                className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${isDone
                                                    ? 'bg-indigo-500 border-indigo-500'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                                                    }`}
                                            >
                                                {isDone && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}

                        {/* Completion Row */}
                        <tr className="bg-indigo-50 dark:bg-indigo-900/20 font-semibold">
                            <td className="sticky left-0 z-10 px-4 py-3 text-sm border-t-2 border-r border-gray-300 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20">
                                <span style={{ color: 'var(--text-primary)' }}>% Completed</span>
                            </td>
                            {days.map(day => {
                                const completion = getDayCompletion(day);
                                return (
                                    <td
                                        key={day.toISOString()}
                                        className={`px-2 py-3 text-center text-xs border-t-2 border-r border-gray-300 dark:border-gray-700 ${isWeekend(day) ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                                            }`}
                                    >
                                        <span className={completion >= 80 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-gray-400'}>
                                            {completion}%
                                        </span>
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
