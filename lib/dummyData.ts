
import { DailyLog } from "@/lib/types/log";
import { subDays } from "date-fns";

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
    profile: 'improving' | 'variable'
): DailyLog[] {
    const rng = new SeededRandom(seed);
    const logs: DailyLog[] = [];

    for (let i = 0; i < days; i++) {
        const date = subDays(new Date(), i);

        // Add random gaps (10% chance)
        const gapChance = profile === 'improving' ? 0.05 + (i / days) * 0.1 : 0.15;
        if (rng.next() < gapChance) continue;

        let workoutDone = false;
        let workoutDuration: number | undefined;
        let mood: number = 3; // Default mid-range
        let energy: number = 3;
        let stress: number = 3;
        let note = "";

        // Profile: Improving (shows positive correlation between activity and mood)
        if (profile === 'improving') {
            const trend = 1 - (i / days); // 1 (recent) to 0 (old)

            // Workout frequency increases over time
            workoutDone = rng.next() > (0.4 - trend * 0.3);
            if (workoutDone) {
                workoutDuration = 20 + Math.floor(rng.next() * 40); // 20-60 min
            }

            // Mood improves over time, higher when workout done
            const baseMood = 2 + (trend * 2); // 2 → 4
            mood = Math.round(baseMood + (workoutDone ? 0.5 : 0) + (rng.next() - 0.5));
            mood = Math.max(1, Math.min(5, mood));

            // Energy correlates with mood and workout
            const baseEnergy = 2 + (trend * 1.5);
            energy = Math.round(baseEnergy + (workoutDone ? 0.7 : 0) + (rng.next() - 0.5));
            energy = Math.max(1, Math.min(5, energy));

            // Stress decreases over time, lower when active
            const baseStress = 4 - (trend * 1.5); // 4 → 2.5
            stress = Math.round(baseStress - (workoutDone ? 0.5 : 0) + (rng.next() - 0.5));
            stress = Math.max(1, Math.min(5, stress));

            if (i < 3 && workoutDone) note = "Feeling good after workout";
            if (i > 25 && i < 30 && !workoutDone) note = "Skipped workout, low energy";
        }
        // Profile: Variable (shows more chaotic patterns)
        else if (profile === 'variable') {
            // Random workout pattern
            workoutDone = rng.next() > 0.5;
            if (workoutDone) {
                workoutDuration = 15 + Math.floor(rng.next() * 60); // 15-75 min
            }

            // More variable mood/energy/stress
            mood = Math.round(2 + rng.next() * 3); // 2-5
            energy = Math.round(2 + rng.next() * 3);
            stress = Math.round(2 + rng.next() * 3);

            // Slight positive correlation with workout
            if (workoutDone && rng.next() > 0.3) {
                mood = Math.min(5, mood + 1);
                energy = Math.min(5, energy + 1);
            }

            if (i === 12) note = "Rough day";
            if (i === 4 && workoutDone) note = "Good session";
        }

        logs.push({
            logId: `dummy_${userId}_${i}`,
            userId,
            date,
            workoutDone,
            workoutDuration,
            mood,
            energy,
            stress,
            note: note || undefined,
            createdAt: new Date(),
        });
    }
    return logs;
}

export function getDummyLogs(userId: string): DailyLog[] {
    // User 1: Admin → Improving pattern (shows positive workout correlation)
    if (userId === 'test_admin_001' || userId === 'user_admin') {
        return generateLogs(userId, 12345, 45, 'improving');
    }

    // User 2: Test → Variable pattern
    return generateLogs(userId, 67890, 45, 'variable');
}
