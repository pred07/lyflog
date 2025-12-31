'use client';

import { HabitConfig, HabitEntry } from '@/lib/types/habit';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HabitCalendarMonthProps {
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    habits: HabitConfig[];
    entries: HabitEntry[];
    onDateClick: (date: Date) => void;
}

export default function HabitCalendarMonth({
    currentMonth,
    onMonthChange,
    habits,
    entries,
    onDateClick
}: HabitCalendarMonthProps) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd
    });

    const getCompletionStats = (date: Date) => {
        const dayEntries = entries.filter(e => isSameDay(e.date, date));
        const completed = dayEntries.filter(e => e.done).length;
        const total = habits.length;
        const percentage = total > 0 ? (completed / total) : 0;
        return { completed, total, percentage };
    };

    const nextMonth = () => onMonthChange(addMonths(currentMonth, 1));
    const prevMonth = () => onMonthChange(subMonths(currentMonth, 1));

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 text-center border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-xs font-semibold text-gray-400 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {days.map(day => {
                    const stats = getCompletionStats(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isCurrentDay = isToday(day);

                    // Heatmap logic
                    let bgClass = 'bg-transparent';
                    if (stats.completed > 0) {
                        // Tailwind opacities specific to indigo
                        if (stats.percentage >= 1) bgClass = 'bg-indigo-500 text-white';
                        else if (stats.percentage >= 0.75) bgClass = 'bg-indigo-400 text-white';
                        else if (stats.percentage >= 0.5) bgClass = 'bg-indigo-300 text-white';
                        else if (stats.percentage >= 0.25) bgClass = 'bg-indigo-200 text-indigo-900';
                        else bgClass = 'bg-indigo-100 text-indigo-800';
                    }

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onDateClick(day)}
                            className={`
                                h-14 md:h-24 p-1 border-b border-r border-gray-100 dark:border-gray-800/50 relative group transition-colors
                                ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/20 text-gray-400' : ''}
                                ${isCurrentDay ? 'ring-2 ring-inset ring-indigo-500 z-10' : ''}
                                hover:bg-gray-50 dark:hover:bg-gray-800
                            `}
                        >
                            <span className={`
                                text-xs font-medium block text-right p-1 mb-1
                                ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500'}
                            `}>
                                {format(day, 'd')}
                            </span>

                            {stats.completed > 0 && (
                                <div className="flex justify-center items-center h-full pb-6">
                                    <div
                                        className={`
                                            w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                            ${bgClass}
                                        `}
                                    >
                                        {stats.completed}
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
