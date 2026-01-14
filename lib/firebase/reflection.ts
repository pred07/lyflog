import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    deleteDoc
} from 'firebase/firestore';
import { db } from './config';
import { ReflectionSession, InsightLogEntry, MetaPattern, PerceivedReason } from '../types/reflection';

const TEST_SESSIONS_KEY = 'test_reflection_sessions';
const TEST_INSIGHTS_KEY = 'test_insight_log';

function isTestUser(userId: string): boolean {
    return userId.startsWith('test_');
}

// ==========================================
// Test User Helpers (localStorage)
// ==========================================

function saveTestSession(session: ReflectionSession): void {
    const sessions = JSON.parse(localStorage.getItem(TEST_SESSIONS_KEY) || '[]');
    // Transform dates to strings for storage
    const storageSession = {
        ...session,
        date: session.date.toISOString(),
        createdAt: session.createdAt.toISOString(),
        detectedPatterns: session.detectedPatterns.map(p => ({
            ...p,
            firstSeen: p.firstSeen.toISOString(),
            lastSeen: p.lastSeen.toISOString()
        }))
    };
    sessions.push(storageSession);
    localStorage.setItem(TEST_SESSIONS_KEY, JSON.stringify(sessions));
}

function getTestSessions(userId: string): ReflectionSession[] {
    const sessions = JSON.parse(localStorage.getItem(TEST_SESSIONS_KEY) || '[]');
    return sessions
        .filter((s: any) => s.userId === userId)
        .map((s: any) => ({
            ...s,
            date: new Date(s.date),
            createdAt: new Date(s.createdAt),
            detectedPatterns: s.detectedPatterns.map((p: any) => ({
                ...p,
                firstSeen: new Date(p.firstSeen),
                lastSeen: new Date(p.lastSeen)
            }))
        }))
        .sort((a: ReflectionSession, b: ReflectionSession) => b.date.getTime() - a.date.getTime());
}

function saveTestInsight(entry: InsightLogEntry): void {
    const insights = JSON.parse(localStorage.getItem(TEST_INSIGHTS_KEY) || '[]');
    const storageEntry = {
        ...entry,
        date: entry.date.toISOString(),
        createdAt: entry.createdAt.toISOString()
    };
    insights.push(storageEntry);
    localStorage.setItem(TEST_INSIGHTS_KEY, JSON.stringify(insights));
}

function getTestInsights(userId: string): InsightLogEntry[] {
    const insights = JSON.parse(localStorage.getItem(TEST_INSIGHTS_KEY) || '[]');
    return insights
        .filter((i: any) => i.userId === userId)
        .map((i: any) => ({
            ...i,
            date: new Date(i.date),
            createdAt: new Date(i.createdAt)
        }))
        .sort((a: InsightLogEntry, b: InsightLogEntry) => b.date.getTime() - a.date.getTime());
}

function deleteTestInsight(entryId: string): void {
    const insights = JSON.parse(localStorage.getItem(TEST_INSIGHTS_KEY) || '[]');
    const filtered = insights.filter((i: any) => i.entryId !== entryId);
    localStorage.setItem(TEST_INSIGHTS_KEY, JSON.stringify(filtered));
}

/**
 * Save reflection session to Firestore
 */
export async function saveReflectionSession(session: ReflectionSession): Promise<void> {
    if (isTestUser(session.userId)) {
        saveTestSession(session);
        return;
    }

    const sessionRef = doc(db, `users/${session.userId}/reflectionSessions/${session.sessionId}`);

    const data = {
        sessionId: session.sessionId,
        userId: session.userId,
        date: Timestamp.fromDate(session.date),
        moodFocus: session.moodFocus,
        perceivedReasons: session.perceivedReasons,
        ruleSetResults: session.ruleSetResults,
        detectedPatterns: session.detectedPatterns.map(p => ({
            ...p,
            firstSeen: Timestamp.fromDate(p.firstSeen),
            lastSeen: Timestamp.fromDate(p.lastSeen)
        })),
        timeWindow: session.timeWindow,
        userNote: session.userNote || null,
        createdAt: Timestamp.fromDate(session.createdAt)
    };

    await setDoc(sessionRef, data);
}

/**
 * Get all reflection sessions for a user
 */
export async function getReflectionSessions(userId: string): Promise<ReflectionSession[]> {
    if (isTestUser(userId)) {
        return getTestSessions(userId);
    }

    const sessionsRef = collection(db, `users/${userId}/reflectionSessions`);
    const q = query(sessionsRef, orderBy('date', 'desc'));

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            sessionId: data.sessionId,
            userId: data.userId,
            date: data.date.toDate(),
            moodFocus: data.moodFocus,
            perceivedReasons: data.perceivedReasons,
            ruleSetResults: data.ruleSetResults,
            detectedPatterns: data.detectedPatterns.map((p: any) => ({
                ...p,
                firstSeen: p.firstSeen.toDate(),
                lastSeen: p.lastSeen.toDate()
            })),
            timeWindow: data.timeWindow,
            userNote: data.userNote,
            createdAt: data.createdAt.toDate()
        };
    });
}

/**
 * Get recent reflection sessions (for recurrence checking)
 */
export async function getRecentReflectionSessions(
    userId: string,
    count: number = 10
): Promise<ReflectionSession[]> {
    if (isTestUser(userId)) {
        const sessions = getTestSessions(userId);
        return sessions.slice(0, count);
    }

    const sessionsRef = collection(db, `users/${userId}/reflectionSessions`);
    const q = query(sessionsRef, orderBy('date', 'desc'), limit(count));

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            sessionId: data.sessionId,
            userId: data.userId,
            date: data.date.toDate(),
            moodFocus: data.moodFocus,
            perceivedReasons: data.perceivedReasons,
            ruleSetResults: data.ruleSetResults,
            detectedPatterns: data.detectedPatterns.map((p: any) => ({
                ...p,
                firstSeen: p.firstSeen.toDate(),
                lastSeen: p.lastSeen.toDate()
            })),
            timeWindow: data.timeWindow,
            userNote: data.userNote,
            createdAt: data.createdAt.toDate()
        };
    });
}

/**
 * Save insight log entry
 */
export async function saveInsightLogEntry(entry: InsightLogEntry): Promise<void> {
    if (isTestUser(entry.userId)) {
        saveTestInsight(entry);
        return;
    }

    const entryRef = doc(db, `users/${entry.userId}/insightLog/${entry.entryId}`);

    const data = {
        entryId: entry.entryId,
        userId: entry.userId,
        sessionId: entry.sessionId,
        date: Timestamp.fromDate(entry.date),
        moodFocus: entry.moodFocus,
        perceivedReasons: entry.perceivedReasons,
        patternsObserved: entry.patternsObserved,
        recurrenceCount: entry.recurrenceCount,
        userNote: entry.userNote || null,
        createdAt: Timestamp.fromDate(entry.createdAt)
    };

    await setDoc(entryRef, data);
}

/**
 * Get insight log for a user
 */
export async function getInsightLog(userId: string): Promise<InsightLogEntry[]> {
    if (isTestUser(userId)) {
        return getTestInsights(userId);
    }

    const logRef = collection(db, `users/${userId}/insightLog`);
    const q = query(logRef, orderBy('date', 'desc'));

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            entryId: data.entryId,
            userId: data.userId,
            sessionId: data.sessionId,
            date: data.date.toDate(),
            moodFocus: data.moodFocus,
            perceivedReasons: data.perceivedReasons,
            patternsObserved: data.patternsObserved,
            recurrenceCount: data.recurrenceCount,
            userNote: data.userNote,
            createdAt: data.createdAt.toDate()
        };
    });
}

/**
 * Delete insight log entry
 */
export async function deleteInsightLogEntry(userId: string, entryId: string): Promise<void> {
    if (isTestUser(userId)) {
        deleteTestInsight(entryId);
        return;
    }

    await deleteDoc(doc(db, `users/${userId}/insightLog/${entryId}`));
}

/**
 * Calculate meta-patterns from all sessions
 */
export async function calculateMetaPatterns(userId: string): Promise<MetaPattern> {
    const sessions = await getReflectionSessions(userId);

    // Calculate reason frequency
    const reasonCounts = new Map<PerceivedReason, number>();
    let totalReasons = 0;

    for (const session of sessions) {
        for (const reason of session.perceivedReasons) {
            reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
            totalReasons++;
        }
    }

    const reasonFrequency = Array.from(reasonCounts.entries())
        .map(([reason, count]) => ({
            reason,
            count,
            percentage: (count / totalReasons) * 100
        }))
        .sort((a, b) => b.count - a.count);

    // Calculate pattern recurrence
    const patternCounts = new Map<string, { count: number; reasons: Set<PerceivedReason> }>();

    for (const session of sessions) {
        for (const pattern of session.detectedPatterns) {
            if (!patternCounts.has(pattern.name)) {
                patternCounts.set(pattern.name, { count: 0, reasons: new Set() });
            }
            const entry = patternCounts.get(pattern.name)!;
            entry.count++;
            session.perceivedReasons.forEach(r => entry.reasons.add(r));
        }
    }

    const recurringPatterns = Array.from(patternCounts.entries())
        .map(([name, data]) => ({
            patternName: name,
            count: data.count,
            reasons: Array.from(data.reasons)
        }))
        .sort((a, b) => b.count - a.count);

    // Detect shifts
    const shifts: string[] = [];

    if (sessions.length >= 5) {
        // Analyze if patterns are changing over time
        const recentSessions = sessions.slice(0, 5);
        const olderSessions = sessions.slice(5, 10);

        const recentPatterns = new Set(
            recentSessions.flatMap(s => s.detectedPatterns.map(p => p.name))
        );
        const olderPatterns = new Set(
            olderSessions.flatMap(s => s.detectedPatterns.map(p => p.name))
        );

        // Check for volatility vs decline
        const hasVolatility = recentPatterns.has('mood-volatility');
        const hasStagnation = recentPatterns.has('mood-stagnation');

        if (hasVolatility && !hasStagnation) {
            shifts.push('Across multiple reflections, mood volatility appears more often than sustained decline.');
        }

        if (hasStagnation && !hasVolatility) {
            shifts.push('Recent patterns show mood stagnation rather than fluctuation.');
        }

        // Check for reason consistency
        const recentReasons = new Set(recentSessions.flatMap(s => s.perceivedReasons));
        const olderReasons = new Set(olderSessions.flatMap(s => s.perceivedReasons));

        const reasonsChanged = Array.from(recentReasons).some(r => !olderReasons.has(r));
        if (reasonsChanged) {
            shifts.push('Your selected reasons vary, but the same stabilization signals repeat.');
        }
    }

    return {
        reasonFrequency,
        recurringPatterns,
        shifts
    };
}
