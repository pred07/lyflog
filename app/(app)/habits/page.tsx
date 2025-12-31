'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { HabitConfig, HabitEntry } from '@/lib/types/habit';
import { saveHabitEntry, getHabitEntriesForDateRange, getDemoHabitEntries } from '@/lib/firebase/habit';
import { updateUserProfile } from '@/lib/firebase/auth';
import HabitChecklistView from '@/components/habits/HabitChecklistView';
import HabitCalendarGrid from '@/components/habits/HabitCalendarGrid';
import HabitCalendarMonth from '@/components/habits/HabitCalendarMonth';
import HabitManager from '@/components/habits/HabitManager';
import DayHabitEditor from '@/components/habits/DayHabitEditor';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Settings, Plus, Calendar } from 'lucide-react';

export default function HabitsPage() {
    const { user } = useAuth();
    const [todayDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [habitStates, setHabitStates] = useState<Record<string, boolean>>({});
    const [allEntries, setAllEntries] = useState<HabitEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showManager, setShowManager] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const habits: HabitConfig[] = user?.habits || [
        { id: 'meditation', label: 'Meditation', group: 'Morning Routine', order: 1 },
        { id: 'reading', label: 'Reading', group: 'Morning Routine', order: 2 },
        { id: 'gym', label: 'Gym', group: 'Health', order: 1 },
        { id: 'walk', label: 'Walk', group: 'Health', order: 2 },
        { id: 'maths', label: 'Maths', group: 'Study', order: 1 },
        { id: 'revision', label: 'Revision', group: 'Study', order: 2 },
    ];

    useEffect(() => {
        if (!user) return;

        const loadHabits = async () => {
            setLoading(true);
            try {
                // Determine date range based on view
                let startDate, endDate;

                if (viewMode === 'week') {
                    startDate = currentWeekStart;
                    endDate = endOfWeek(currentWeekStart);
                } else {
                    startDate = startOfWeek(startOfMonth(currentMonth));
                    endDate = endOfWeek(endOfMonth(currentMonth));
                }

                let entries;
                if (user.userId.startsWith('test_')) {
                    entries = getDemoHabitEntries(user.userId, startDate, endDate);
                } else {
                    entries = await getHabitEntriesForDateRange(user.userId, startDate, endDate);
                }

                setAllEntries(entries);

                // Filter today's entries
                const todayStr = format(todayDate, 'yyyy-MM-dd');
                const todayEntries = entries.filter(e => format(e.date, 'yyyy-MM-dd') === todayStr);

                const states: Record<string, boolean> = {};
                todayEntries.forEach(entry => {
                    states[entry.habitId] = entry.done;
                });

                setHabitStates(states);
            } catch (error) {
                console.error('Failed to load habits:', error);
            } finally {
                setLoading(false);
            }
        };

        loadHabits();
    }, [user, todayDate, currentWeekStart, currentMonth, viewMode]);

    const handleToggle = async (habitId: string) => {
        if (!user) return;

        const newState = !habitStates[habitId];
        setHabitStates(prev => ({ ...prev, [habitId]: newState }));

        // Save to Firestore (skip for test accounts)
        if (!user.userId.startsWith('test_')) {
            try {
                await saveHabitEntry(user.userId, habitId, todayDate, newState);
            } catch (error) {
                console.error('Failed to save habit:', error);
                // Revert on error
                setHabitStates(prev => ({ ...prev, [habitId]: !newState }));
            }
        }
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
    };

    const handleDayToggle = async (habitId: string, done: boolean, note?: string) => {
        if (!user || !selectedDate) return;

        // Update local state
        const updatedEntries = allEntries.filter(e => !(isSameDay(e.date, selectedDate) && e.habitId === habitId));
        const newEntry: HabitEntry = {
            id: `${habitId}_${format(selectedDate, 'yyyy-MM-dd')}`,
            userId: user.userId,
            habitId,
            date: selectedDate,
            done,
            notes: note || '',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        setAllEntries([...updatedEntries, newEntry]);

        // Save to Firestore (skip for test accounts)
        if (!user.userId.startsWith('test_')) {
            try {
                await saveHabitEntry(user.userId, habitId, selectedDate, done, note);
            } catch (error) {
                console.error('Failed to save habit:', error);
            }
        }
    };

    const handleUpdateHabits = async (newHabits: HabitConfig[]) => {
        if (!user) return;
        try {
            await updateUserProfile(user.userId, { habits: newHabits });
            // Force reload to get updated habits from user context
            window.location.reload();
        } catch (error) {
            console.error('Failed to update habits:', error);
        }
    };

    const goToPreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    const goToThisWeek = () => setCurrentWeekStart(startOfWeek(new Date()));

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
            {/* Header */}
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Habit Calendar
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Mark what happened today.</p>
                    <p className="text-sm text-gray-400 mt-1">{format(todayDate, 'EEEE, MMMM d, yyyy')}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowManager(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                        title="Manage Habits"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : (
                <>
                    {/* Today's Checklist */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Today
                        </h2>
                        <HabitChecklistView
                            habits={habits}
                            habitStates={habitStates}
                            onToggle={handleToggle}
                        />
                    </div>

                    {/* Weekly/Monthly Calendar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <button
                                    onClick={() => setViewMode('week')}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${viewMode === 'week'
                                        ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Week
                                </button>
                                <button
                                    onClick={() => setViewMode('month')}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${viewMode === 'month'
                                        ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Month
                                </button>
                            </div>

                            {viewMode === 'week' && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={goToPreviousWeek}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={goToThisWeek}
                                        className="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                                    >
                                        This Week
                                    </button>
                                    <button
                                        onClick={goToNextWeek}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {viewMode === 'week' ? (
                            <HabitCalendarGrid
                                weekStart={currentWeekStart}
                                habits={habits}
                                entries={allEntries}
                                onDateClick={handleDateClick}
                            />
                        ) : (
                            <HabitCalendarMonth
                                currentMonth={currentMonth}
                                onMonthChange={setCurrentMonth}
                                habits={habits}
                                entries={allEntries}
                                onDateClick={handleDateClick}
                            />
                        )}
                    </div>

                    {/* Guideline */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg text-xs text-gray-500 border border-gray-100 dark:border-gray-800">
                        💡 <strong>✔</strong> = happened. <strong>No streaks, no scores, no pressure.</strong> Just presence tracking.
                    </div>
                </>
            )}

            {/* Modals */}
            {showManager && (
                <HabitManager
                    habits={habits}
                    onUpdate={handleUpdateHabits}
                    onClose={() => setShowManager(false)}
                />
            )}

            {selectedDate && (
                <DayHabitEditor
                    date={selectedDate}
                    habits={habits}
                    entries={allEntries.filter(e => isSameDay(e.date, selectedDate))}
                    onToggle={handleDayToggle}
                    onClose={() => setSelectedDate(null)}
                />
            )}
        </div>
    );
}
