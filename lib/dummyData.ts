
import { DailyLog } from "@/lib/types/log";
import { subDays, format } from "date-fns";

// Seeded random number generator for consistent results
class SeededRandom {
    private seed: number;
    constructor(seed: number) { this.seed = seed; }
    next(): number {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
}

function generateLogs(
    userId: string,
    seed: number,
    days: number,
    profile: 'stabilizing' | 'chaotic'
): DailyLog[] {
    const rng = new SeededRandom(seed);
    const logs: DailyLog[] = [];

    for (let i = 0; i < days; i++) {
        const date = subDays(new Date(), i);
        // Add random gaps (10% chance), but less likely recently for 'stabilizing'
        const gapChance = profile === 'stabilizing' ? 0.05 + (i / days) * 0.1 : 0.15;
        if (rng.next() < gapChance) continue;

        let sleep: number | null = null;
        let workout: { type: 'cardio' | 'strength' | 'flexibility' | 'other'; duration: number; intensity: 'light' | 'moderate' | 'vigorous' } | null = null;
        let meditation: number | null = null;
        let learning: number | null = null;
        let note = "";

        // ALGORITHM: User 1 (Admin) - High Stress -> Stabilizing
        if (profile === 'stabilizing') {
            // Sleep: Bad early (30 days ago), Good recent. 
            // Normalize i (0 is today, 45 is past). 
            // Trend: Sleep improves as `i` gets smaller.
            const trend = 1 - (i / days); // 0 (past) -> 1 (today)
            const baseSleep = 5 + (trend * 2.5); // 5h -> 7.5h
            const variance = 2 - (trend * 1.5); // High variance -> Low variance
            sleep = Number((baseSleep + (rng.next() - 0.5) * variance).toFixed(1));

            // Workout: Correlates with better sleep days
            if (sleep > 6 && rng.next() > 0.4) {
                workout = { type: 'other', duration: 30 + Math.floor(rng.next() * 30), intensity: 'moderate' };
            }

            // Learning: Low when sleep is low (Correlation #1)
            if (sleep > 5.5) {
                learning = 15 + Math.floor(rng.next() * 45);
            } else {
                learning = Math.floor(rng.next() * 15);
            }

            // Meditation: Sporadic
            if (rng.next() > 0.7) meditation = 5 + Math.floor(rng.next() * 10);

            if (i < 3) note = "Feeling clearer lately.";
            if (i > 25 && i < 30) note = "Rough night. Work stress high.";

        }
        // ALGORITHM: User 2 (Test) - Chaotic / Breakup
        else if (profile === 'chaotic') {
            // Sleep: Highly variable, no clear trend
            sleep = Number((4 + rng.next() * 5).toFixed(1)); // 4h to 9h random

            // Workout: Random, sporadic bursts
            if (rng.next() > 0.6) {
                workout = { type: 'cardio', duration: 20 + Math.floor(rng.next() * 60), intensity: 'vigorous' };
            }

            // Meditation: Rare
            if (rng.next() > 0.85) meditation = 10;

            // Learning: Zero on bad days
            if (sleep > 6) learning = Math.floor(rng.next() * 60);

            if (i === 12) note = "Hard day.";
            if (i === 4) note = "Couldn't focus.";
        }

        logs.push({
            logId: `dummy_${userId}_${i}`,
            userId,
            date,
            createdAt: new Date(),
            sleep: sleep ?? undefined,
            workout: workout ?? undefined,
            meditation: meditation ?? undefined,
            learning: learning ?? undefined,
            note: note || undefined
        });
    }
    return logs;
}

export function getDummyLogs(userId: string): DailyLog[] {
    // Check if we already created dummy data for this session/user? 
    // Actually, for "test" users we want it to persist in localStorage so they can see "their" data.
    // This helper just GENERATES it. The caller handles saving if empty.

    // User 1: Admin -> Stabilizing
    if (userId === 'test_admin' || userId === 'user_admin') {
        return generateLogs(userId, 12345, 45, 'stabilizing');
    }

    // User 2: Test -> Chaotic
    return generateLogs(userId, 67890, 45, 'chaotic');
}
