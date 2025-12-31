
import { DailyLog } from '@/lib/types/log';

export interface DataPoint {
    x: number | undefined;
    y: number | undefined;
}

export interface CorrelationResult {
    metricX: string;
    metricY: string;
    coefficient: number;
    sampleSize: number;
    significance: 'high' | 'medium' | 'low';
}

export interface FrequencyResult {
    totalDays: number;
    matchingDays: number;
    percentage: number;
}

/**
 * Extracts a numeric value for a given metric key from a DailyLog.
 * Supports core metrics (sleep, workout, etc.), custom metrics, and exposures.
 */
export const getMetricValue = (log: DailyLog, metric: string): number | undefined => {
    // Core Metrics
    if (metric === 'workout') return log.workout?.duration;
    if (metric === 'sleep') return log.sleep;
    if (metric === 'meditation') return log.meditation;
    if (metric === 'learning') return log.learning;
    if (metric === 'mood') return log.metrics?.['mood']; // Common default?

    // Explicit Core mappings if needed, but 'sleep' etc are top level.

    // Try Custom Metrics (Personal States)
    if (log.metrics?.[metric] !== undefined) return log.metrics[metric];

    // Try Exposures
    if (log.exposures?.[metric] !== undefined) return log.exposures[metric];

    return undefined;
};

/**
 * Calculates Pearson correlation coefficient between two metrics in a set of logs.
 */
export const calculateCorrelation = (logs: DailyLog[], metricX: string, metricY: string): number | null => {
    const data: DataPoint[] = logs
        .map(log => ({
            x: getMetricValue(log, metricX),
            y: getMetricValue(log, metricY)
        }))
        .filter(d => d.x !== undefined && d.y !== undefined);

    if (data.length < 2) return null;

    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + (d.x || 0), 0);
    const sumY = data.reduce((sum, d) => sum + (d.y || 0), 0);
    const sumXY = data.reduce((sum, d) => sum + (d.x || 0) * (d.y || 0), 0);
    const sumX2 = data.reduce((sum, d) => sum + Math.pow(d.x || 0, 2), 0);
    const sumY2 = data.reduce((sum, d) => sum + Math.pow(d.y || 0, 2), 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return null;
    return numerator / denominator;
};

/**
 * Scans for all significant correlations in the logs.
 * Returns a list of relationships with coefficient > threshold (default 0.3 to find candidates, 0.6 is significant).
 */
export const findSignificantCorrelations = (
    logs: DailyLog[],
    metrics: string[],
    threshold: number = 0.6,
    minSamples: number = 20
): CorrelationResult[] => {
    const results: CorrelationResult[] = [];

    // Avoid duplicates (A vs B, B vs A) by loops
    for (let i = 0; i < metrics.length; i++) {
        for (let j = i + 1; j < metrics.length; j++) {
            const m1 = metrics[i];
            const m2 = metrics[j];

            const data = logs.filter(l =>
                getMetricValue(l, m1) !== undefined &&
                getMetricValue(l, m2) !== undefined
            );

            if (data.length < minSamples) continue;

            const corr = calculateCorrelation(logs, m1, m2);

            if (corr !== null && Math.abs(corr) >= threshold) {
                results.push({
                    metricX: m1,
                    metricY: m2,
                    coefficient: corr,
                    sampleSize: data.length,
                    significance: data.length >= 50 ? 'high' : 'medium'
                });
            }
        }
    }

    return results.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));
};

/**
 * Calculates how often a condition is met within a subset of logs.
 * useful for "On days with High Focus, 80% also had 7h+ Sleep".
 */
export const calculateFrequency = (subsetLogs: DailyLog[], targetMetric: string, predicate: (val: number) => boolean): FrequencyResult => {
    const total = subsetLogs.length;
    if (total === 0) return { totalDays: 0, matchingDays: 0, percentage: 0 };

    const matching = subsetLogs.filter(log => {
        const val = getMetricValue(log, targetMetric);
        return val !== undefined && predicate(val);
    }).length;

    // ... (previous content)

    return {
        totalDays: total,
        matchingDays: matching,
        percentage: Math.round((matching / total) * 100)
    };
};

/**
 * Normalizes metric values to a 0-1 range for fair distance calculation.
 * Needs the global min/max for each metric from the entire history.
 */
export const normalizeValue = (val: number, min: number, max: number) => {
    if (max === min) return 0.5; // No variance
    return (val - min) / (max - min);
};

/**
 * Calculates Euclidean distance between two logs across multiple metrics.
 * Metrics inputs should be keys like ['sleep', 'focus', 'anxiety'].
 */
export const calculateDistance = (
    logA: DailyLog,
    logB: DailyLog,
    metrics: string[],
    ranges: Record<string, { min: number, max: number }>
): number => {
    let sumSq = 0;
    let count = 0;

    metrics.forEach(m => {
        const valA = getMetricValue(logA, m);
        const valB = getMetricValue(logB, m);

        if (valA !== undefined && valB !== undefined) {
            const range = ranges[m] || { min: 0, max: 10 }; // Default range fallback
            const normA = normalizeValue(valA, range.min, range.max);
            const normB = normalizeValue(valB, range.min, range.max);

            sumSq += Math.pow(normA - normB, 2);
            count++;
        }
    });

    if (count === 0) return Infinity; // No overlapping metrics
    // Normalize by count so missing metrics don't skew too much (average squared error)
    return Math.sqrt(sumSq / count);
};

/**
 * Finds days in history that are most similar to the target log (usually today).
 */
export const findSimilarDays = (
    targetLog: DailyLog,
    historyLogs: DailyLog[],
    metrics: string[],
    limit: number = 3
) => {
    // 1. Calculate Ranges for normalization
    const ranges: Record<string, { min: number, max: number }> = {};
    metrics.forEach(m => {
        let min = Infinity;
        let max = -Infinity;
        historyLogs.forEach(l => {
            const val = getMetricValue(l, m);
            if (val !== undefined) {
                if (val < min) min = val;
                if (val > max) max = val;
            }
        });
        // Include target in range finding
        const targetVal = getMetricValue(targetLog, m);
        if (targetVal !== undefined) {
            if (targetVal < min) min = targetVal;
            if (targetVal > max) max = targetVal;
        }
        ranges[m] = { min, max };
    });

    // 2. Calculate Distances
    const scored = historyLogs
        .filter(l => l.logId !== targetLog.logId) // Don't match self
        .map(l => ({
            log: l,
            distance: calculateDistance(targetLog, l, metrics, ranges)
        }))
        .filter(item => item.distance !== Infinity);

    // 3. Sort by Distance (Lower is better)
    scored.sort((a, b) => a.distance - b.distance);

    return scored.slice(0, limit);
};
