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
