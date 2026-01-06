'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { HabitConfig, HabitEntry } from '@/lib/types/habit';
import { saveHabitEntry, getHabitEntriesForDateRange, getDemoHabitEntries } from '@/lib/firebase/habit';
import { updateUserProfile } from '@/lib/firebase/auth';
import HabitChecklistView from '@/components/habits/HabitChecklistView';
import HabitSpreadsheetCalendar from '@/components/habits/HabitSpreadsheetCalendar';
import HabitManager from '@/components/habits/HabitManager';
import DayHabitEditor from '@/components/habits/DayHabitEditor';
import { format, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { Settings, Plus } from 'lucide-react';

export default function HabitsPage() {
    const { user } = useAuth();
    const [todayDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedSheet, setSelectedSheet] = useState<string>('all'); // Track selected sheet

    const [habitStates, setHabitStates] = useState<Record<string, boolean>>({});
    const [allEntries, setAllEntries] = useState<HabitEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showManager, setShowManager] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Default sheets if user hasn't created any
    const defaultSheets = [
        { id: 'routine', label: 'Routine', order: 1, color: '#6366f1' },
        { id: 'gym', label: 'Gym', order: 2, color: '#ec4899' },
        { id: 'work', label: 'Work', order: 3, color: '#f59e0b' }
    ];

    const habitSheets = user?.habitSheets || defaultSheets;

    const habits: HabitConfig[] = user?.habits || [
        { id: 'meditation', label: 'Meditation', group: 'Morning Routine', sheetId: 'routine', order: 1 },
        { id: 'reading', label: 'Reading', group: 'Morning Routine', sheetId: 'routine', order: 2 },
        { id: 'gym', label: 'Gym', group: 'Health', sheetId: 'gym', order: 1 },
        { id: 'walk', label: 'Walk', group: 'Health', sheetId: 'routine', order: 2 },
        { id: 'maths', label: 'Maths', group: 'Study', sheetId: 'work', order: 1 },
        { id: 'revision', label: 'Revision', group: 'Study', sheetId: 'work', order: 2 },
    ];

    // Filter habits by selected sheet
    const filteredHabits = selectedSheet === 'all'
        ? habits
        : habits.filter(h => h.sheetId === selectedSheet);

    useEffect(() => {
        if (!user) return;

        const loadHabits = async () => {
            setLoading(true);
            try {
                // Determine date range based on view
                let entries: HabitEntry[] = [];

                if (user.userId.startsWith('test_')) {
                    entries = getDemoHabitEntries(user.userId);
                } else {
                    const monthStart = startOfMonth(currentMonth);
                    const monthEnd = endOfMonth(currentMonth);
                    entries = await getHabitEntriesForDateRange(user.userId, monthStart, monthEnd);
                }

                setAllEntries(entries);

                // Set today's states
                const todayEntries = entries.filter(e => isSameDay(e.date, todayDate));
                const states: Record<string, boolean> = {};
                todayEntries.forEach(entry => {
                    states[entry.habitId] = entry.done;
                });
                setHabitStates(states);
            } catch (error) {
                console.error('Failed to load habit entries:', error);
            } finally {
                setLoading(false);
            }
        };

        loadHabits();
    }, [user, currentMonth, todayDate]);

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

    const handleDayToggle = async (habitId: string, date: Date, done: boolean) => {
        if (!user) return;

        // Update local state
        const updatedEntries = allEntries.filter(e => !(isSameDay(e.date, date) && e.habitId === habitId));
        const newEntry: HabitEntry = {
            id: `${habitId}_${format(date, 'yyyy-MM-dd')}`,
            userId: user.userId,
            habitId,
            date: date,
            done,
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        setAllEntries([...updatedEntries, newEntry]);

        // Save to Firestore (skip for test accounts)
        if (!user.userId.startsWith('test_')) {
            try {
                await saveHabitEntry(user.userId, habitId, date, done);
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

    const handleAddGroupHabit = async (group: string) => {
        if (!user) return;

        const groupHabits = habits.filter(h => h.group === group);
        const maxOrder = groupHabits.reduce((max, h) => Math.max(max, h.order), 0);

        const newHabit: HabitConfig = {
            id: `habit_${Date.now()}`,
            label: 'New Habit',
            group,
            sheetId: selectedSheet === 'all' ? 'routine' : selectedSheet, // Default to current sheet
            order: maxOrder + 1
        };

        const updatedHabits = [...habits, newHabit];
        await handleUpdateHabits(updatedHabits);
    };

    const handleEditHabit = async (updatedHabit: HabitConfig) => {
        const updatedHabits = habits.map(h =>
            h.id === updatedHabit.id ? updatedHabit : h
        );
        await handleUpdateHabits(updatedHabits);
    };

    const handleDeleteHabit = async (habitId: string) => {
        const updatedHabits = habits.filter(h => h.id !== habitId);
        await handleUpdateHabits(updatedHabits);
    };

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
                        className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-2"
                        title="Add Habit"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Add Habit</span>
                    </button>
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
                    {/* Sheet Tabs */}
                    <div className="mb-6">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <button
                                onClick={() => setSelectedSheet('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedSheet === 'all'
                                    ? 'bg-indigo-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                All Habits
                            </button>
                            {habitSheets.map(sheet => (
                                <button
                                    key={sheet.id}
                                    onClick={() => setSelectedSheet(sheet.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedSheet === sheet.id
                                        ? 'text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                    style={selectedSheet === sheet.id ? { backgroundColor: sheet.color || '#6366f1' } : {}}
                                >
                                    {sheet.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Today's Checklist */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Today</h2>
                        <HabitChecklistView
                            habits={filteredHabits}
                            habitStates={habitStates}
                            onToggle={handleToggle}
                            onAdd={handleAddGroupHabit}
                            onEdit={handleEditHabit}
                            onDelete={handleDeleteHabit}
                        />
                    </div>

                    {/* Spreadsheet Calendar */}
                    <div className="mb-8">
                        <HabitSpreadsheetCalendar
                            currentMonth={currentMonth}
                            onMonthChange={setCurrentMonth}
                            habits={filteredHabits}
                            entries={allEntries}
                            onToggle={handleDayToggle}
                            onRename={async (habitId, newName) => {
                                const updatedHabits = habits.map(h =>
                                    h.id === habitId ? { ...h, label: newName } : h
                                );
                                await handleUpdateHabits(updatedHabits);
                            }}
                        />
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
                    onToggle={(habitId, done, note) => handleDayToggle(habitId, selectedDate, done)}
                    onClose={() => setSelectedDate(null)}
                />
            )}

            {/* Mobile FAB */}
            <button
                onClick={() => setShowManager(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center sm:hidden z-50 transition-all"
                aria-label="Add Habit"
            >
                <Plus size={28} />
            </button>
        </div>
    );
}
