import { DailyLog } from '@/lib/types/log';
import { db } from './config';
import {
    collection,
    doc,
    setDoc,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    deleteDoc
} from 'firebase/firestore';

const LOGS_COLLECTION = 'daily_logs';

// For test accounts, use localStorage
const TEST_LOGS_KEY = 'test_logs';

function isTestUser(userId: string): boolean {
    return userId.startsWith('test_');
}

// Test account log storage (localStorage)
async function createTestLog(userId: string, logData: Partial<DailyLog>): Promise<DailyLog> {
    const logs = JSON.parse(localStorage.getItem(TEST_LOGS_KEY) || '[]');

    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const log: DailyLog = {
        logId,
        userId,
        date: logData.date || new Date(),
        sleep: logData.sleep,
        workout: logData.workout,
        meditation: logData.meditation,
        learning: logData.learning,
        note: logData.note,
        metrics: logData.metrics,
        createdAt: new Date(),
    };

    logs.push({
        ...log,
        date: log.date.toISOString(),
        createdAt: log.createdAt.toISOString(),
    });

    localStorage.setItem(TEST_LOGS_KEY, JSON.stringify(logs));
    return log;
}

async function getTestLogs(userId: string): Promise<DailyLog[]> {
    let logs = JSON.parse(localStorage.getItem(TEST_LOGS_KEY) || '[]');

    // Filter for specific user
    let userLogs = logs.filter((log: any) => log.userId === userId);

    // If no logs exist for this test user, generate dummy data
    if (userLogs.length === 0) {
        const { getDummyLogs } = await import('@/lib/dummyData');
        const dummyLogs = getDummyLogs(userId);

        // Add to local storage
        const formattedDummyLogs = dummyLogs.map(log => ({
            ...log,
            date: log.date.toISOString(),
            createdAt: log.createdAt.toISOString()
        }));

        logs = [...logs, ...formattedDummyLogs];
        localStorage.setItem(TEST_LOGS_KEY, JSON.stringify(logs));
        userLogs = formattedDummyLogs;
    }

    return userLogs
        .map((log: any) => ({
            ...log,
            date: new Date(log.date),
            createdAt: new Date(log.createdAt),
        }))
        .sort((a: DailyLog, b: DailyLog) => b.date.getTime() - a.date.getTime());
}

async function deleteTestLog(logId: string): Promise<void> {
    const logs = JSON.parse(localStorage.getItem(TEST_LOGS_KEY) || '[]');
    const filteredLogs = logs.filter((log: any) => log.logId !== logId);
    localStorage.setItem(TEST_LOGS_KEY, JSON.stringify(filteredLogs));
}

async function deleteAllTestLogs(userId: string): Promise<void> {
    const logs = JSON.parse(localStorage.getItem(TEST_LOGS_KEY) || '[]');
    const filteredLogs = logs.filter((log: any) => log.userId !== userId);
    localStorage.setItem(TEST_LOGS_KEY, JSON.stringify(filteredLogs));
}

// Main functions that route to test or Firebase
export async function createLog(userId: string, logData: Partial<DailyLog>): Promise<DailyLog> {
    if (isTestUser(userId)) {
        return createTestLog(userId, logData);
    }

    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const log: any = {
        logId,
        userId,
        date: logData.date ? Timestamp.fromDate(logData.date) : Timestamp.now(),
        createdAt: Timestamp.now(),
    };

    if (logData.sleep !== undefined) log.sleep = logData.sleep;
    if (logData.workout) log.workout = logData.workout;
    if (logData.meditation !== undefined) log.meditation = logData.meditation;
    if (logData.learning !== undefined) log.learning = logData.learning;
    if (logData.note) log.note = logData.note;
    if (logData.metrics) log.metrics = logData.metrics;

    await setDoc(doc(db, LOGS_COLLECTION, logId), log);

    return {
        ...log,
        date: log.date.toDate(),
        createdAt: log.createdAt.toDate(),
    };
}

export async function getUserLogs(userId: string): Promise<DailyLog[]> {
    if (isTestUser(userId)) {
        return getTestLogs(userId);
    }

    const logsRef = collection(db, LOGS_COLLECTION);
    const q = query(
        logsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            logId: data.logId,
            userId: data.userId,
            date: data.date.toDate(),
            sleep: data.sleep,
            workout: data.workout,
            meditation: data.meditation,
            learning: data.learning,
            note: data.note,
            metrics: data.metrics,
            createdAt: data.createdAt.toDate(),
        };
    });
}

export async function deleteLog(logId: string): Promise<void> {
    // Check if it's a test log
    const testLogs = JSON.parse(localStorage.getItem(TEST_LOGS_KEY) || '[]');
    if (testLogs.some((log: any) => log.logId === logId)) {
        return deleteTestLog(logId);
    }

    await deleteDoc(doc(db, LOGS_COLLECTION, logId));
}

export async function deleteAllUserLogs(userId: string): Promise<void> {
    if (isTestUser(userId)) {
        return deleteAllTestLogs(userId);
    }

    const logsRef = collection(db, LOGS_COLLECTION);
    const q = query(logsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
}
