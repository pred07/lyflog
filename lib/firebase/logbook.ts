import { db } from './config';
import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    where,
    orderBy,
    addDoc,
    updateDoc,
    limit
} from 'firebase/firestore';
import { LogbookConfig, LogbookEntry } from '@/lib/types/logbook';

// --- LOGBOOK CONFIGURATION (Stored in User Profile for now, or separate collection?) ---
// For v1.6, we'll store LogbookConfigs in the USER document for simplicity, 
// matching how we handle Metrics/Exposures.
// Entries will be in a subcollection.

export const createLogbook = async (userId: string, logbook: LogbookConfig) => {
    // iterate current user logbooks and add new one
    // This requires reading user first. Alternatively, we can use arrayUnion if we change logic.
    // implementing via updateUserProfile is cleaner if we reuse existing auth/profile logic.
    // For now, let's export a helper that prepares the object.

    // Actually, distinct collection for Logbooks might be better for sharing later?
    // User Requirement: "Logbook entries... in a new Firestore sub-collection".
    // Configs: "Logbooks will be defined in the User profile".

    // So configs are inside User. entries are subcollection.
    return logbook;
};

// --- LOGBOOK ENTRIES (Subcollection) ---

export const addLogbookEntry = async (userId: string, entry: Omit<LogbookEntry, 'id'>) => {
    const entriesRef = collection(db, 'users', userId, 'logbookEntries');
    const docRef = await addDoc(entriesRef, {
        ...entry,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return { ...entry, id: docRef.id } as LogbookEntry;
};

export const getLogbookEntries = async (userId: string, logbookId: string, limitCount = 50) => {
    const entriesRef = collection(db, 'users', userId, 'logbookEntries');
    const q = query(
        entriesRef,
        where('logbookId', '==', logbookId),
        orderBy('date', 'desc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(), // Convert Firestore Timestamp
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
    })) as LogbookEntry[];
};

// Demo data for test accounts
export const getDemoLogbookEntries = (userId: string, logbookId: string): LogbookEntry[] => {
    if (!userId.startsWith('test_') || logbookId !== 'gym_training') return [];

    const today = new Date();
    const entries: LogbookEntry[] = [];

    // Generate 10 realistic gym entries over the past 2 weeks
    const exercises = [
        { name: 'Bench Press', weight: [60, 65, 70, 75], reps: [12, 10, 8, 6] },
        { name: 'Squat', weight: [80, 85, 90, 95], reps: [10, 8, 6, 5] },
        { name: 'Deadlift', weight: [100, 105, 110], reps: [8, 6, 5] },
        { name: 'Overhead Press', weight: [40, 45, 50], reps: [10, 8, 6] },
        { name: 'Pull-ups', weight: [0], reps: [12, 10, 8] },
    ];

    let entryId = 1;
    for (let dayOffset = 14; dayOffset >= 0; dayOffset -= 2) {
        const sessionDate = new Date(today);
        sessionDate.setDate(today.getDate() - dayOffset);

        // Pick 3-4 exercises per session
        const sessionExercises = exercises.slice(0, 3 + (dayOffset % 2));

        sessionExercises.forEach((ex, idx) => {
            const setNum = idx % ex.weight.length;
            entries.push({
                id: `demo_${userId}_${entryId++}`,
                logbookId,
                userId,
                date: sessionDate,
                data: {
                    exercise: ex.name,
                    weight: ex.weight[setNum],
                    reps: ex.reps[setNum],
                    done: dayOffset > 2 || Math.random() > 0.2, // Most recent are done, older might have skips
                    notes: idx === 0 && dayOffset === 0 ? 'Felt strong today' : ''
                },
                createdAt: sessionDate,
                updatedAt: sessionDate
            });
        });
    }

    return entries.reverse(); // Most recent first
};
