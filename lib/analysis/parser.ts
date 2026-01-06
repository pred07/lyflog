import { DailyLog } from '@/lib/types/log';

interface ParseResult {
    updates: Partial<DailyLog>;
    matchedKeys: string[];
}

/**
 * Parses natural language text to extract metrics.
 * Example: "Sleep 7.5 hours, workout 45 minutes, anxiety 3"
 */
export const parseNaturalLanguageLog = (text: string): ParseResult => {
    const lower = text.toLowerCase();
    const updates: any = { metrics: {}, exposures: {} }; // Flexible Partial<DailyLog> with nesting
    const matchedKeys: string[] = [];

    // Helper to find number after keyword
    // Matches: "keyword 7", "keyword: 7", "keyword - 7", "keyword for 7"
    const extractValue = (keywords: string[]): number | null => {
        for (const word of keywords) {
            // Regex: look for word boundaries, optional separators, then a number (int or float)
            // e.g. \bsleep\b.*?\b(\d+(\.\d+)?)\b
            const regex = new RegExp(`\\b${word}\\b[^0-9-]*?(\\d+(\\.\\d+)?)`, 'i');
            const match = lower.match(regex);
            if (match && match[1]) {
                return parseFloat(match[1]);
            }
        }
        return null;
    };

    // 1. Core Metrics

    // Sleep
    const sleepVal = extractValue(['sleep', 'slept', 'rest']);
    if (sleepVal !== null) {
        updates.sleep = sleepVal;
        matchedKeys.push('sleep');
    }

    // Meditation
    const medVal = extractValue(['meditation', 'meditate', 'mindfulness']);
    if (medVal !== null) {
        updates.meditation = medVal;
        matchedKeys.push('meditation');
    }

    // Workout
    // Since workout is an object { duration, type, intensity }, we simplify to just duration for voice v1
    const workoutVal = extractValue(['workout', 'exercise', 'gym', 'run', 'train']);
    if (workoutVal !== null) {
        updates.workout = { duration: workoutVal }; // Caution: Overwrites type/intensity if deep merge not used later
        matchedKeys.push('workout');
    }

    // Learning
    const learnVal = extractValue(['learning', 'study', 'read', 'reading']);
    if (learnVal !== null) {
        updates.learning = learnVal;
        matchedKeys.push('learning');
    }

    // 2. Common States (Custom Metrics)
    // We can't know dynamic user metric IDs easily without passing them in.
    // For now, we hardcode common ones or expect the caller to merge.
    // Let's support: Anxiety, Focus, Mood, Energy
    ['anxiety', 'focus', 'mood', 'energy'].forEach(key => {
        const val = extractValue([key]);
        if (val !== null) {
            if (!updates.metrics) updates.metrics = {};
            updates.metrics[key] = val; // Assuming ID matches keyword
            matchedKeys.push(key);
        }
    });

    // 3. Tags (Hashtags)
    const hashtags = text.match(/#[a-zA-Z0-9_]+/g);
    if (hashtags) {
        updates.tags = hashtags.map(t => t.slice(1)); // Remove #
        matchedKeys.push('tags');
    }

    return { updates, matchedKeys };
};
