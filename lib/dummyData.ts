
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
        let metrics: Record<string, number> | undefined;
        let exposures: Record<string, number> | undefined;

        // ALGORITHM: User 1 (Admin) - High Stress -> Stabilizing
        if (profile === 'stabilizing') {
            // Sleep Trend (Already existing logic)
            const trend = 1 - (i / days);
            const baseSleep = 5 + (trend * 2.5);
            const variance = 2 - (trend * 1.5);
            sleep = Number((baseSleep + (rng.next() - 0.5) * variance).toFixed(1));

            // Workout
            if (sleep > 6 && rng.next() > 0.4) {
                workout = { type: 'other', duration: 30 + Math.floor(rng.next() * 30), intensity: 'moderate' };
            }

            // Learning
            if (sleep > 5.5) {
                learning = 15 + Math.floor(rng.next() * 45);
            } else {
                learning = Math.floor(rng.next() * 15);
            }

            // Meditation
            if (rng.next() > 0.7) meditation = 5 + Math.floor(rng.next() * 10);

            // --- CUSTOM METRICS & EXPOSURES ---
            // Anxiety: Decreases as trend increases (more stable)
            // High Anxiety in past (i=45), Low Anxiety now (i=0)
            const anxietyBase = 4 - (trend * 2); // 4 -> 2
            let anxiety = Math.round(anxietyBase + (rng.next() - 0.5) * 2);
            anxiety = Math.max(1, Math.min(5, anxiety));

            // Focus: Correlated with Sleep - Anxiety
            const focusBase = sleep > 6.5 ? 4 : 2;
            let focus = Math.round(focusBase - (anxiety / 5) + rng.next());
            focus = Math.max(1, Math.min(5, focus));

            // Caffeine (Exposure): Count
            // Reducing caffeine over time
            const caffeineCount = rng.next() > trend ? 1 + Math.floor(rng.next() * 3) : 0 + Math.floor(rng.next() * 1);

            metrics = { anxiety, focus };
            exposures = { caffeine: caffeineCount, screen_time: 120 + Math.floor(rng.next() * 120) }; // High screen time

            if (i < 3) note = "Feeling clearer lately.";
            if (i > 25 && i < 30) note = "Rough night. Work stress high.";

        }
        // ALGORITHM: User 2 (Test) - Chaotic / Breakup
        else if (profile === 'chaotic') {
            sleep = Number((4 + rng.next() * 5).toFixed(1));

            if (rng.next() > 0.6) {
                workout = { type: 'cardio', duration: 20 + Math.floor(rng.next() * 60), intensity: 'vigorous' };
            }

            if (rng.next() > 0.85) meditation = 10;
            if (sleep > 6) learning = Math.floor(rng.next() * 60);

            // Chaotic Metrics
            const anxiety = Math.random() > 0.5 ? 4 : 2; // Bipolar-ish swings
            const focus = sleep > 7 ? 4 : 1;

            // High Exposures
            const caffeineCount = 2 + Math.floor(rng.next() * 3);
            const alcoholCount = rng.next() > 0.7 ? 1 + Math.floor(rng.next() * 4) : 0;

            metrics = { anxiety, focus };
            exposures = { caffeine: caffeineCount, alcohol: alcoholCount };

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
            note: note || undefined,
            metrics: metrics,
            exposures: exposures
        });
    }
    return logs;
}

export function getDummyLogs(userId: string): DailyLog[] {
    // Check if we already created dummy data for this session/user? 
    // Actually, for "test" users we want it to persist in localStorage so they can see "their" data.
    // This helper just GENERATES it. The caller handles saving if empty.

    // User 1: Admin -> Stabilizing
    if (userId === 'test_admin_001' || userId === 'user_admin') {
        return generateLogs(userId, 12345, 45, 'stabilizing');
    }

    // User 2: Test -> Chaotic
    return generateLogs(userId, 67890, 45, 'chaotic');
}
