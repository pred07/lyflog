import { db } from './config';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { SessionEntry } from '@/lib/types/session';

export const addSessionEntry = async (userId: string, entry: Omit<SessionEntry, 'id'>) => {
    const entriesRef = collection(db, 'users', userId, 'sessionEntries');
    const docRef = await addDoc(entriesRef, {
        ...entry,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return { ...entry, id: docRef.id } as SessionEntry;
};

export const getSessionEntries = async (userId: string, limitCount = 20) => {
    const entriesRef = collection(db, 'users', userId, 'sessionEntries');
    const q = query(
        entriesRef,
        orderBy('date', 'desc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
    })) as SessionEntry[];
};

// Get unique exercise names from history for autocomplete
export const getExerciseHistory = async (userId: string): Promise<string[]> => {
    const entries = await getSessionEntries(userId, 50);
    const exerciseNames = new Set<string>();

    entries.forEach(entry => {
        entry.exercises.forEach(ex => exerciseNames.add(ex.name));
    });

    return Array.from(exerciseNames).sort();
};

// Demo data for test accounts
export const getDemoSessionEntries = (userId: string): SessionEntry[] => {
    if (!userId.startsWith('test_')) return [];

    const today = new Date();
    const entries: SessionEntry[] = [];

    // Generate 5 realistic gym sessions
    const sessions = [
        { type: 'Chest & Triceps', exercises: ['Bench Press', 'Incline DB Press', 'Triceps Extension'] },
        { type: 'Back & Biceps', exercises: ['Deadlift', 'Pull-ups', 'Barbell Curl'] },
        { type: 'Legs', exercises: ['Squat', 'Leg Press', 'Calf Raises'] },
    ];

    for (let i = 0; i < 5; i++) {
        const sessionDate = new Date(today);
        sessionDate.setDate(today.getDate() - (i * 3));

        const session = sessions[i % sessions.length];

        entries.push({
            id: `demo_session_${i}`,
            userId,
            date: sessionDate,
            sessionType: session.type,
            exercises: session.exercises.map((name, idx) => ({
                id: `ex_${i}_${idx}`,
                name,
                sets: [
                    { weight: 60 + (idx * 10), reps: 12, done: true, notes: '' },
                    { weight: 65 + (idx * 10), reps: 10, done: true, notes: '' },
                    { weight: 70 + (idx * 10), reps: 8, done: i > 0, notes: i === 0 ? 'PR!' : '' },
                ]
            })),
            createdAt: sessionDate,
            updatedAt: sessionDate
        });
    }

    return entries;
};
