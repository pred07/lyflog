
import { db } from './config';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { DailyLog } from '@/lib/types/log';
import { HabitEntry } from '@/lib/types/habit';
import { SessionEntry } from '@/lib/types/session';
import { LogbookEntry } from '@/lib/types/logbook';
import { startOfDay, endOfDay, isSameDay, format } from 'date-fns';

export interface DayContext {
    date: Date;
    log: DailyLog | null;
    habits: HabitEntry[];
    sessions: SessionEntry[];
    logbookEntries: LogbookEntry[];
}

export const getTimelineData = async (userId: string, startDate: Date, endDate: Date): Promise<DayContext[]> => {
    if (userId.startsWith('test_')) {
        return getDemoTimelineData(userId, startDate, endDate);
    }

    const startTimestamp = Timestamp.fromDate(startOfDay(startDate));
    const endTimestamp = Timestamp.fromDate(endOfDay(endDate));

    // 1. Fetch Daily Logs
    const logsRef = collection(db, 'users', userId, 'dailyLogs');
    const logsQuery = query(logsRef, where('date', '>=', startTimestamp), where('date', '<=', endTimestamp));
    const logsSnapshot = await getDocs(logsQuery);
    const logs = logsSnapshot.docs.map(doc => ({ ...doc.data(), date: doc.data().date.toDate() } as DailyLog));

    // 2. Fetch Session Entries (Legacy)
    const sessionsRef = collection(db, 'users', userId, 'sessionEntries');
    const sessionsQuery = query(sessionsRef, where('date', '>=', startTimestamp), where('date', '<=', endTimestamp));
    const sessionsSnapshot = await getDocs(sessionsQuery);
    const sessions = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
    } as SessionEntry));

    // 3. Fetch Habit Entries
    const habitsRef = collection(db, 'users', userId, 'habitEntries');
    const habitsQuery = query(habitsRef, where('date', '>=', startTimestamp), where('date', '<=', endTimestamp));
    const habitsSnapshot = await getDocs(habitsQuery);
    const habits = habitsSnapshot.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().date.toDate()
    } as HabitEntry));

    // 4. Fetch Logbook Entries (New)
    const logbooksRef = collection(db, 'users', userId, 'logbookEntries');
    const logbooksQuery = query(
        logbooksRef,
        where('date', '>=', startTimestamp),
        where('date', '<=', endTimestamp),
        where('deleted', '!=', true)
    );
    const logbooksSnapshot = await getDocs(logbooksQuery);
    const logbookEntries = logbooksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
    } as LogbookEntry));

    // 5. Aggregate by Date
    const dayMap = new Map<string, DayContext>();

    const addToMap = (date: Date) => {
        const key = format(date, 'yyyy-MM-dd');
        if (!dayMap.has(key)) {
            dayMap.set(key, {
                date: startOfDay(date),
                log: null,
                habits: [],
                sessions: [],
                logbookEntries: []
            });
        }
        return dayMap.get(key)!;
    };

    logs.forEach(log => {
        const day = addToMap(log.date);
        day.log = log;
    });

    sessions.forEach(session => {
        const day = addToMap(session.date);
        day.sessions.push(session);
    });

    habits.forEach(habit => {
        const day = addToMap(habit.date);
        day.habits.push(habit);
    });

    logbookEntries.forEach(entry => {
        const day = addToMap(entry.date);
        day.logbookEntries.push(entry);
    });

    // Convert map to sorted array (newest first)
    return Array.from(dayMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
};


const getDemoTimelineData = (userId: string, startDate: Date, endDate: Date): DayContext[] => {
    const days: DayContext[] = [];
    const current = new Date(endDate);

    while (current >= startDate) {
        // Randomly skip some days to make it realistic
        if (Math.random() > 0.1) {
            days.push({
                date: new Date(current),
                log: Math.random() > 0.3 ? {
                    date: new Date(current),
                    sleep: 7 + Math.random() * 2,
                    anxiety: Math.floor(Math.random() * 5) + 1,
                    focus: Math.floor(Math.random() * 5) + 1,
                    energy: Math.floor(Math.random() * 5) + 1,
                    metrics: { 'mood': 4 },
                    exposures: { 'caffeine': 2 },
                    notes: Math.random() > 0.7 ? "Felt pretty good today." : undefined
                } as any : null,
                habits: [
                    { id: 'mock-h1', userId, habitId: 'h1', date: new Date(current), done: Math.random() > 0.5, notes: '', createdAt: new Date(current), updatedAt: new Date(current) },
                    { id: 'mock-h2', userId, habitId: 'h2', date: new Date(current), done: Math.random() > 0.5, notes: 'Felt tired', createdAt: new Date(current), updatedAt: new Date(current) }
                ].filter(h => h.done),
                sessions: [],
                logbookEntries: [] // Demo logic for logbook entries could be added here
            });
        }
        current.setDate(current.getDate() - 1);
    }

    return days;
};
