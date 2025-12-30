import { DailyLog } from '@/lib/types/log';

const DEMO_MODE = false; // Set to false when Firebase is configured
const LOGS_KEY = 'demo_logs';

// Demo mode: localStorage-based logs (no Firebase required)
export async function createLogDemo(userId: string, logData: Partial<DailyLog>): Promise<DailyLog> {
    const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');

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
        createdAt: new Date(),
    };

    logs.push({
        ...log,
        date: log.date.toISOString(),
        createdAt: log.createdAt.toISOString(),
    });

    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));

    return log;
}

export async function getUserLogsDemo(userId: string): Promise<DailyLog[]> {
    const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');

    return logs
        .filter((log: any) => log.userId === userId)
        .map((log: any) => ({
            ...log,
            date: new Date(log.date),
            createdAt: new Date(log.createdAt),
        }))
        .sort((a: DailyLog, b: DailyLog) => b.date.getTime() - a.date.getTime());
}

export async function deleteLogDemo(logId: string): Promise<void> {
    const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
    const filteredLogs = logs.filter((log: any) => log.logId !== logId);
    localStorage.setItem(LOGS_KEY, JSON.stringify(filteredLogs));
}

export async function deleteAllUserLogsDemo(userId: string): Promise<void> {
    const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
    const filteredLogs = logs.filter((log: any) => log.userId !== userId);
    localStorage.setItem(LOGS_KEY, JSON.stringify(filteredLogs));
}

// Wrapper functions that use demo mode or Firebase based on DEMO_MODE flag
export async function createLog(userId: string, logData: Partial<DailyLog>): Promise<DailyLog> {
    if (DEMO_MODE) {
        return createLogDemo(userId, logData);
    }

    // Firebase implementation (original code)
    const { db } = await import('./config');
    const { collection, doc, setDoc, Timestamp } = await import('firebase/firestore');

    const LOGS_COLLECTION = 'daily_logs';
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

    await setDoc(doc(db, LOGS_COLLECTION, logId), log);

    return {
        ...log,
        date: log.date.toDate(),
        createdAt: log.createdAt.toDate(),
    };
}

export async function getUserLogs(userId: string): Promise<DailyLog[]> {
    if (DEMO_MODE) {
        return getUserLogsDemo(userId);
    }

    // Firebase implementation
    const { db } = await import('./config');
    const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');

    const LOGS_COLLECTION = 'daily_logs';
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
            createdAt: data.createdAt.toDate(),
        };
    });
}

export async function deleteLog(logId: string): Promise<void> {
    if (DEMO_MODE) {
        return deleteLogDemo(logId);
    }

    // Firebase implementation
    const { db } = await import('./config');
    const { doc, deleteDoc } = await import('firebase/firestore');

    await deleteDoc(doc(db, 'daily_logs', logId));
}

export async function deleteAllUserLogs(userId: string): Promise<void> {
    if (DEMO_MODE) {
        return deleteAllUserLogsDemo(userId);
    }

    // Firebase implementation
    const { db } = await import('./config');
    const { collection, query, where, getDocs, deleteDoc } = await import('firebase/firestore');

    const LOGS_COLLECTION = 'daily_logs';
    const logsRef = collection(db, LOGS_COLLECTION);
    const q = query(logsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
}
