import { DailyLog } from '../types/log';

/**
 * Statistical and analysis helper functions for reflection analyzer
 */

// ============================================
// Basic Statistics
// ============================================

export function average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const avg = average(values);
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    return average(squaredDiffs);
}

export function calculateStdDev(values: number[]): number {
    return Math.sqrt(calculateVariance(values));
}

// ============================================
// Trend Detection
// ============================================

export function detectIncreasingTrend(values: number[]): boolean {
    if (values.length < 3) return false;

    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    return slope > 0.1; // Positive slope threshold
}

export function detectDecreasingTrend(values: number[]): boolean {
    if (values.length < 3) return false;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    return slope < -0.1; // Negative slope threshold
}

// ============================================
// Pattern Detection
// ============================================

export function detectMoodDrops(logs: DailyLog[]): number[] {
    const drops: number[] = [];

    for (let i = 1; i < logs.length; i++) {
        const prev = logs[i - 1].mood;
        const curr = logs[i].mood;

        // Detect drop of 2+ points
        if (prev - curr >= 2) {
            drops.push(i);
        }
    }

    return drops;
}

export function detectMoodSpikes(logs: DailyLog[]): number[] {
    const spikes: number[] = [];

    for (let i = 1; i < logs.length; i++) {
        const prev = logs[i - 1].mood;
        const curr = logs[i].mood;

        // Detect spike of 2+ points
        if (curr - prev >= 2) {
            spikes.push(i);
        }
    }

    return spikes;
}

export function detectVolatility(logs: DailyLog[], metric: 'mood' | 'energy' | 'stress'): boolean {
    const values = logs.map(l => l[metric]);
    const variance = calculateVariance(values);

    // High variance threshold (for 1-5 scale)
    return variance > 1.2;
}

// ============================================
// Content Analysis
// ============================================

export function detectThemeRepetition(notes: string[]): number {
    if (notes.length < 2) return 0;

    // Simple word frequency analysis
    const wordCounts = new Map<string, number>();
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);

    // Count words across all notes
    for (const note of notes) {
        const words = note.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
        for (const word of words) {
            wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
    }

    // Find most repeated words
    const maxCount = Math.max(...Array.from(wordCounts.values()));
    const repetitionScore = maxCount / notes.length;

    return repetitionScore;
}

export function detectNoteLengthIncrease(logs: DailyLog[]): boolean {
    const noteLengths = logs
        .filter(l => l.note)
        .map(l => l.note!.length);

    if (noteLengths.length < 3) return false;

    return detectIncreasingTrend(noteLengths);
}

// ============================================
// Correlation Analysis
// ============================================

export function calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0 || !isFinite(denominator)) return 0;
    const r = numerator / denominator;
    return isFinite(r) ? r : 0;
}

export function detectStressEnergyCoupling(logs: DailyLog[]): boolean {
    const stress = logs.map(l => l.stress);
    const energy = logs.map(l => l.energy);

    const correlation = calculateCorrelation(stress, energy);

    // Negative correlation (high stress, low energy)
    return correlation < -0.4;
}

// ============================================
// Activity Analysis
// ============================================

export function calculateActivityFrequency(logs: DailyLog[]): number {
    if (logs.length === 0) return 0;
    const activeDays = logs.filter(l => l.workoutDone).length;
    return activeDays / logs.length;
}

export function detectActivityWithdrawal(logs: DailyLog[]): boolean {
    if (logs.length < 6) return false;

    const midpoint = Math.floor(logs.length / 2);
    const firstHalf = logs.slice(0, midpoint);
    const secondHalf = logs.slice(midpoint);

    const firstActivity = calculateActivityFrequency(firstHalf);
    const secondActivity = calculateActivityFrequency(secondHalf);

    // 40% or more reduction
    return secondActivity < firstActivity * 0.6;
}

export function detectStructureBenefit(logs: DailyLog[]): boolean {
    const activeDays = logs.filter(l => l.workoutDone);
    const inactiveDays = logs.filter(l => !l.workoutDone);

    if (activeDays.length < 2 || inactiveDays.length < 2) return false;

    const activeMood = average(activeDays.map(l => l.mood));
    const inactiveMood = average(inactiveDays.map(l => l.mood));

    // Active days have 0.5+ higher mood
    return activeMood > inactiveMood + 0.5;
}

// ============================================
// Signal Strength Calculation
// ============================================

export function calculateSignalStrength(
    logs: DailyLog[],
    metric: 'volatility' | 'trend' | 'correlation' | 'frequency',
    values: number[]
): number {
    switch (metric) {
        case 'volatility':
            const variance = calculateVariance(values);
            return Math.min(variance / 2, 1); // Normalize to 0-1

        case 'trend':
            const n = values.length;
            const sumX = (n * (n - 1)) / 2;
            const sumY = values.reduce((sum, val) => sum + val, 0);
            const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
            const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            return Math.min(Math.abs(slope), 1);

        case 'correlation':
            return Math.abs(values[0]); // Assumes values[0] is correlation coefficient

        case 'frequency':
            return values[0]; // Assumes values[0] is frequency 0-1

        default:
            return 0;
    }
}
