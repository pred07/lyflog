import { DailyLog } from './log';

// ============================================
// Core Types
// ============================================

export type MoodFocus =
    | 'low'
    | 'flat'
    | 'anxious'
    | 'heavy'
    | 'unstable'
    | 'okay-but-fragile';

export type PerceivedReason =
    | 'relationship-change'
    | 'career-uncertainty'
    | 'social-conflict'
    | 'loss-separation'
    | 'identity-confusion'
    | 'motivation-issues'
    | 'overthinking'
    | 'general-stress'
    | 'unsure';

export const MOOD_FOCUS_LABELS: Record<MoodFocus, string> = {
    'low': 'Low',
    'flat': 'Flat',
    'anxious': 'Anxious',
    'heavy': 'Heavy',
    'unstable': 'Unstable',
    'okay-but-fragile': 'Okay but fragile'
};

export const PERCEIVED_REASON_LABELS: Record<PerceivedReason, string> = {
    'relationship-change': 'Relationship change',
    'career-uncertainty': 'Career uncertainty',
    'social-conflict': 'Social conflict / bullying',
    'loss-separation': 'Loss or separation',
    'identity-confusion': 'Identity confusion',
    'motivation-issues': 'Motivation issues',
    'overthinking': 'Overthinking / rumination',
    'general-stress': 'General stress',
    'unsure': 'Unsure / mixed'
};

// ============================================
// Reflection Session
// ============================================

export interface ReflectionSession {
    sessionId: string;
    userId: string;
    date: Date;

    // User selections
    moodFocus: MoodFocus;
    perceivedReasons: PerceivedReason[];
    timeWindow: number; // days (7, 14, 30)

    // Analysis results
    ruleSetResults: RuleSetResult[];
    detectedPatterns: DetectedPattern[];

    // User note (optional)
    userNote?: string;

    // Metadata
    createdAt: Date;
}

// ============================================
// Rule Set & Analysis
// ============================================

export interface Signal {
    type: string;
    detected: boolean;
    strength: number; // 0-1
    description: string;
}

export interface RuleSetResult {
    ruleSetId: string;
    ruleSetName: string;
    reason: PerceivedReason;

    // Detected signals
    signals: Signal[];

    // Observations (never conclusions)
    observations: string[];

    // Pattern metadata
    timeWindow: number;
    dataPoints: number;
    confidence: 'low' | 'medium' | 'high';
}

export interface DetectedPattern {
    patternId: string;
    name: string;
    description: string;
    occurrences: number;
    firstSeen: Date;
    lastSeen: Date;
    relatedReasons: PerceivedReason[];
}

// ============================================
// Insight Log
// ============================================

export interface InsightLogEntry {
    entryId: string;
    userId: string;
    sessionId: string;
    date: Date;

    // What user explored
    moodFocus: MoodFocus;
    perceivedReasons: PerceivedReason[];

    // What was found
    patternsObserved: string[];
    recurrenceCount: number;

    // User note (optional)
    userNote?: string;

    createdAt: Date;
}

// ============================================
// Meta Patterns
// ============================================

export interface MetaPattern {
    // Reason frequency
    reasonFrequency: Array<{
        reason: PerceivedReason;
        count: number;
        percentage: number;
    }>;

    // Pattern recurrence
    recurringPatterns: Array<{
        patternName: string;
        count: number;
        reasons: PerceivedReason[];
    }>;

    // Shifts over time
    shifts: string[];
}

// ============================================
// Rule Set Definition (for engine)
// ============================================

export type AnalysisType = 'volatility' | 'trend' | 'coupling' | 'frequency' | 'content' | 'variance';
export type MetricType = 'mood' | 'energy' | 'stress' | 'activity' | 'notes';

export interface FocusArea {
    metric: MetricType;
    analysisType: AnalysisType;
}

export interface Rule {
    id: string;
    condition: (logs: DailyLog[], window: number) => boolean;
    signal: Signal;
    weight: number;
}

export interface ObservationTemplate {
    condition: string; // e.g., "mood-volatility && rumination"
    template: string;
}

export interface RuleSet {
    id: string;
    name: string;
    reason: PerceivedReason;
    description: string;
    focusAreas: FocusArea[];
    rules: Rule[];
    observationTemplates: ObservationTemplate[];
}
