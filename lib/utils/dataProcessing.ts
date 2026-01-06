
import { DailyLog } from "@/lib/types/log";
import { startOfWeek, endOfWeek, format, isSameWeek, subWeeks, addWeeks, getWeek } from "date-fns";

export interface WeeklyData {
    weekStart: Date;
    weekLabel: string; // e.g., "Oct 23"
    total: number;
    avg: number;
    count: number;
}

/**
 * Groups daily log data by week for a specific metric (exposure or core).
 * Returns array of weekly summaries.
 */
export const groupDataByWeek = (logs: DailyLog[], metricKey: string, isExposure = false): WeeklyData[] => {
    if (!logs || logs.length === 0) return [];

    // 1. Sort logs by date (oldest first)
    const sortedLogs = [...logs].sort((a, b) => a.date.getTime() - b.date.getTime());

    // 2. Determine range
    // We want at least the last 8 weeks for trend visibility
    const cutoffDate = subWeeks(new Date(), 8);
    const relevantLogs = sortedLogs.filter(l => l.date >= cutoffDate);

    // Initialize map for aggregation
    const weekMap = new Map<string, { total: number; count: number; start: Date }>();

    // Fill with empty weeks first to ensure continuity
    let currentWeek = startOfWeek(cutoffDate);
    const end = endOfWeek(new Date());

    while (currentWeek <= end) {
        const key = format(currentWeek, 'yyyy-ww');
        weekMap.set(key, { total: 0, count: 0, start: currentWeek });
        currentWeek = addWeeks(currentWeek, 1);
    }

    // Aggregate data
    relevantLogs.forEach(log => {
        let val: number | undefined;

        if (isExposure) {
            val = log.exposures?.[metricKey];
        } else if (metricKey === 'sleep') {
            val = log.sleep;
        } else if (metricKey === 'workout') {
            val = log.workout?.duration;
        } else {
            val = log.metrics?.[metricKey]; // Fallback
        }

        if (val !== undefined && val !== null) {
            const weekStart = startOfWeek(log.date);
            const key = format(weekStart, 'yyyy-ww');

            if (weekMap.has(key)) {
                const entry = weekMap.get(key)!;
                entry.total += val;
                entry.count += 1;
            }
        }
    });

    // Convert map to array
    return Array.from(weekMap.values()).map(entry => ({
        weekStart: entry.start,
        weekLabel: format(entry.start, 'MMM d'),
        total: entry.total,
        avg: entry.count > 0 ? entry.total / entry.count : 0,
        count: entry.count
    }));
};
