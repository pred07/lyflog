
import { db } from './config';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { ContextZone } from '@/lib/types/context';

const COLLECTION = 'contextZones';

export const getContextZones = async (userId: string): Promise<ContextZone[]> => {
    // If test user, return mock data
    if (userId.startsWith('test_')) {
        return [
            {
                id: 'mock-zone-1',
                userId,
                label: 'Vacation',
                startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 2 weeks aog
                endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
                color: '#facc15', // Yellow
                createdAt: new Date()
            }
        ];
    }

    const q = query(
        collection(db, 'users', userId, COLLECTION),
        orderBy('startDate', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate.toDate(),
        endDate: doc.data().endDate.toDate(),
        createdAt: doc.data().createdAt.toDate()
    } as ContextZone));
};

export const addContextZone = async (userId: string, zone: Omit<ContextZone, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    if (userId.startsWith('test_')) return 'mock-id';

    const docRef = await addDoc(collection(db, 'users', userId, COLLECTION), {
        ...zone,
        userId,
        startDate: Timestamp.fromDate(zone.startDate),
        endDate: Timestamp.fromDate(zone.endDate),
        createdAt: Timestamp.now()
    });
    return docRef.id;
};

export const deleteContextZone = async (userId: string, zoneId: string): Promise<void> => {
    if (userId.startsWith('test_')) return;

    await deleteDoc(doc(db, 'users', userId, COLLECTION, zoneId));
};
