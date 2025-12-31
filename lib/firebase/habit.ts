import { db } from './config';
import { collection, doc, setDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { HabitEntry } from '@/lib/types/habit';
import { format, startOfDay, endOfDay } from 'date-fns';

export const saveHabitEntry = async (userId: string, habitId: string, date: Date, done: boolean, notes?: string) => {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    const entryId = `${userId}_${habitId}_${dateStr}`;

    const entryRef = doc(db, 'users', userId, 'habitEntries', entryId);
    await setDoc(entryRef, {
        userId,
        habitId,
        date: startOfDay(date),
        done,
        notes: notes || '',
        updatedAt: new Date()
    }, { merge: true });
};

export const getHabitEntriesForDateRange = async (userId: string, startDate: Date, endDate: Date): Promise<HabitEntry[]> => {
    const entriesRef = collection(db, 'users', userId, 'habitEntries');
    const q = query(
        entriesRef,
        where('date', '>=', startOfDay(startDate)),
        where('date', '<=', endOfDay(endDate)),
        orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
    })) as HabitEntry[];
};

// Demo data for test accounts
export const getDemoHabitEntries = (userId: string, startDate: Date, endDate: Date): HabitEntry[] => {
    if (!userId.startsWith('test_')) return [];

    const entries: HabitEntry[] = [];
    const habitIds = ['meditation', 'reading', 'gym', 'walk', 'maths', 'revision'];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        habitIds.forEach((habitId, idx) => {
            // Simulate realistic patterns (some habits done more consistently)
            const consistency = idx < 3 ? 0.8 : 0.6; // Morning habits more consistent
            const done = Math.random() < consistency;

            entries.push({
                id: `demo_${userId}_${habitId}_${format(currentDate, 'yyyy-MM-dd')}`,
                userId,
                habitId,
                date: new Date(currentDate),
                done,
                notes: '',
                createdAt: new Date(currentDate),
                updatedAt: new Date(currentDate)
            });
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return entries;
};
