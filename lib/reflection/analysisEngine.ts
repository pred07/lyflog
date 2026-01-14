import { DailyLog } from '../types/log';
import {
    ReflectionSession,
    RuleSetResult,
    Signal,
    DetectedPattern,
    MoodFocus,
    PerceivedReason,
    RuleSet
} from '../types/reflection';
import { getRuleSetForReason, validateObservationText } from './ruleSets';
import { calculateVariance } from './analysisHelpers';

/**
 * Generate unique ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Run a single rule set against logs
 */
export function runRuleSet(
    ruleSet: RuleSet,
    logs: DailyLog[],
    timeWindow: number
): RuleSetResult {
    const signals: Signal[] = [];

    // Run each rule
    for (const rule of ruleSet.rules) {
        try {
            const detected = rule.condition(logs, timeWindow);
            const signal: Signal = { ...rule.signal };
            signal.detected = detected;

            // Calculate signal strength if detected
            if (detected) {
                signal.strength = calculateRuleSignalStrength(logs, rule.id);
            }

            signals.push(signal);
        } catch (error) {
            console.error(`Error running rule ${rule.id}:`, error);
            signals.push({ ...rule.signal, detected: false, strength: 0 });
        }
    }

    // Generate observations based on detected signals
    const observations = generateObservations(ruleSet, signals);

    // Determine confidence based on data points
    const confidence = logs.length >= 10 ? 'high' : logs.length >= 5 ? 'medium' : 'low';

    return {
        ruleSetId: ruleSet.id,
        ruleSetName: ruleSet.name,
        reason: ruleSet.reason,
        signals,
        observations,
        timeWindow,
        dataPoints: logs.length,
        confidence
    };
}

/**
 * Calculate signal strength for a specific rule
 */
function calculateRuleSignalStrength(logs: DailyLog[], ruleId: string): number {
    // Rule-specific strength calculations
    switch (ruleId) {
        case 'mood-volatility':
        case 'stress-volatility':
            const metric = ruleId.includes('mood') ? 'mood' : 'stress';
            const variance = calculateVariance(logs.map(l => l[metric]));
            return Math.min(variance / 2, 1);

        case 'rumination':
        case 'theme-repetition':
            // Based on note repetition score
            return 0.7; // Placeholder - actual calculation in rule condition

        case 'activity-withdrawal':
        case 'reduced-activity':
            const activityFreq = logs.filter(l => l.workoutDone).length / logs.length;
            return Math.max(0, 1 - activityFreq);

        case 'stress-energy-coupling':
            return 0.6; // Placeholder - correlation strength

        case 'structure-benefit':
            return 0.7; // Placeholder - mood difference

        case 'low-energy-pattern':
            const avgEnergy = logs.reduce((sum, l) => sum + l.energy, 0) / logs.length;
            return Math.max(0, 1 - (avgEnergy / 5));

        default:
            return 0.5; // Default moderate strength
    }
}

/**
 * Generate observations from detected signals
 */
function generateObservations(ruleSet: RuleSet, signals: Signal[]): string[] {
    const observations: string[] = [];
    const detectedSignals = signals.filter(s => s.detected);

    if (detectedSignals.length === 0) {
        return ['No significant patterns detected in this time window. Consider extending the time range or logging more data.'];
    }

    // Try to match observation templates
    for (const template of ruleSet.observationTemplates) {
        if (matchesCondition(template.condition, detectedSignals)) {
            const observation = fillTemplate(template.template, signals);

            // Validate language
            try {
                validateObservationText(observation);
                observations.push(observation);
            } catch (error) {
                console.error('Language validation failed:', error);
                // Skip this observation
            }
        }
    }

    // If no templates matched, generate generic observation
    if (observations.length === 0 && detectedSignals.length > 0) {
        const signalNames = detectedSignals.map(s => s.description.toLowerCase()).join(', ');
        observations.push(`The following signals were detected: ${signalNames}.`);
    }

    return observations;
}

/**
 * Check if detected signals match a template condition
 */
function matchesCondition(condition: string, detectedSignals: Signal[]): boolean {
    const signalTypes = new Set(detectedSignals.map(s => s.type));

    // Parse condition (e.g., "mood-volatility && rumination")
    const parts = condition.split('&&').map(p => p.trim());

    // All parts must be present
    return parts.every(part => signalTypes.has(part));
}

/**
 * Fill template with signal data
 */
function fillTemplate(template: string, signals: Signal[]): string {
    // For now, return template as-is
    // Future: could replace placeholders with actual values
    return template;
}

/**
 * Main analysis function - runs reflection analysis
 */
export async function analyzePatterns(
    userId: string,
    logs: DailyLog[],
    moodFocus: MoodFocus,
    reasons: PerceivedReason[],
    timeWindow: number
): Promise<ReflectionSession> {
    // Get applicable rule sets
    const ruleSets = reasons.map(reason => getRuleSetForReason(reason));

    // Remove duplicates
    const uniqueRuleSets = Array.from(
        new Map(ruleSets.map(rs => [rs.id, rs])).values()
    );

    // Run each rule set
    const results: RuleSetResult[] = [];
    for (const ruleSet of uniqueRuleSets) {
        const result = runRuleSet(ruleSet, logs, timeWindow);
        results.push(result);
    }

    // Detect patterns across all results
    const patterns = detectPatternsFromResults(results);

    // Create session
    const session: ReflectionSession = {
        sessionId: generateId(),
        userId,
        date: new Date(),
        moodFocus,
        perceivedReasons: reasons,
        ruleSetResults: results,
        detectedPatterns: patterns,
        timeWindow,
        createdAt: new Date()
    };

    return session;
}

/**
 * Detect patterns from rule set results
 */
function detectPatternsFromResults(results: RuleSetResult[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const now = new Date();

    // Collect all detected signals
    const allSignals = results.flatMap(r => r.signals.filter(s => s.detected));

    // Group by signal type
    const signalGroups = new Map<string, Signal[]>();
    for (const signal of allSignals) {
        if (!signalGroups.has(signal.type)) {
            signalGroups.set(signal.type, []);
        }
        signalGroups.get(signal.type)!.push(signal);
    }

    // Create pattern for each signal type
    for (const [type, signals] of Array.from(signalGroups.entries())) {
        const pattern: DetectedPattern = {
            patternId: generateId(),
            name: type,
            description: signals[0].description,
            occurrences: 1, // Will be updated when checking against history
            firstSeen: now,
            lastSeen: now,
            relatedReasons: results.map(r => r.reason)
        };
        patterns.push(pattern);
    }

    return patterns;
}

/**
 * Check pattern recurrence against previous sessions
 */
export function checkPatternRecurrence(
    currentPatterns: DetectedPattern[],
    previousSessions: ReflectionSession[]
): DetectedPattern[] {
    const updatedPatterns = [...currentPatterns];

    for (const pattern of updatedPatterns) {
        let occurrences = 1;
        let firstSeen = pattern.firstSeen;

        // Check each previous session
        for (const session of previousSessions) {
            for (const prevPattern of session.detectedPatterns) {
                if (prevPattern.name === pattern.name) {
                    occurrences++;
                    if (prevPattern.firstSeen < firstSeen) {
                        firstSeen = prevPattern.firstSeen;
                    }
                }
            }
        }

        pattern.occurrences = occurrences;
        pattern.firstSeen = firstSeen;
    }

    return updatedPatterns;
}
