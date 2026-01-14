import { RuleSet, PerceivedReason } from '../types/reflection';
import { DailyLog } from '../types/log';
import {
    average,
    calculateVariance,
    detectMoodDrops,
    detectVolatility,
    detectThemeRepetition,
    detectActivityWithdrawal,
    detectStressEnergyCoupling,
    detectStructureBenefit,
    detectNoteLengthIncrease,
    calculateSignalStrength
} from './analysisHelpers';

/**
 * Language validation - ensures no diagnostic/prescriptive language
 */
const FORBIDDEN_PHRASES = [
    'you are',
    'you should',
    'you must',
    'you need',
    'this means',
    'indicates',
    'diagnosis',
    'recovery',
    'healing',
    'stuck',
    'broken',
    'fixed',
    'disorder',
    'condition',
    'treatment',
    'cure'
];

export function validateObservationText(text: string): boolean {
    const lowerText = text.toLowerCase();
    for (const phrase of FORBIDDEN_PHRASES) {
        if (lowerText.includes(phrase)) {
            throw new Error(`Forbidden phrase detected: "${phrase}" in: "${text}"`);
        }
    }
    return true;
}

/**
 * Rule Set: Relationship Change Lens
 * Focus: Emotional fluctuation, rumination, activity patterns
 */
export const relationshipChangeRuleSet: RuleSet = {
    id: 'relationship-change',
    name: 'Relationship Change Lens',
    reason: 'relationship-change',
    description: 'Analyzes emotional fluctuation and rumination patterns',

    focusAreas: [
        { metric: 'mood', analysisType: 'volatility' },
        { metric: 'notes', analysisType: 'content' },
        { metric: 'activity', analysisType: 'frequency' }
    ],

    rules: [
        {
            id: 'mood-volatility',
            condition: (logs: DailyLog[], window: number) => {
                const moodValues = logs.map(l => l.mood);
                const variance = calculateVariance(moodValues);
                const drops = detectMoodDrops(logs);
                return variance > 1.2 && drops.length >= 3;
            },
            signal: {
                type: 'mood-volatility',
                detected: false,
                strength: 0,
                description: 'Repeated mood fluctuations detected'
            },
            weight: 1.0
        },
        {
            id: 'rumination',
            condition: (logs: DailyLog[], window: number) => {
                const notes = logs.filter(l => l.note).map(l => l.note!);
                if (notes.length < 3) return false;
                return detectThemeRepetition(notes) > 0.6;
            },
            signal: {
                type: 'rumination',
                detected: false,
                strength: 0,
                description: 'Recurring themes in notes'
            },
            weight: 0.8
        },
        {
            id: 'activity-withdrawal',
            condition: (logs: DailyLog[], window: number) => {
                return detectActivityWithdrawal(logs);
            },
            signal: {
                type: 'activity-withdrawal',
                detected: false,
                strength: 0,
                description: 'Reduced activity frequency'
            },
            weight: 0.7
        }
    ],

    observationTemplates: [
        {
            condition: 'mood-volatility && rumination',
            template: 'Your data shows emotional fluctuation with recurring low points rather than steady decline. This pattern often appears when attention repeatedly returns to the same context.'
        },
        {
            condition: 'mood-volatility && activity-withdrawal',
            template: 'Mood variability appears alongside reduced activity. Fluctuation patterns are present rather than consistent decline.'
        },
        {
            condition: 'mood-volatility',
            template: 'Emotional fluctuation is present, with repeated movement between states rather than sustained low mood.'
        },
        {
            condition: 'rumination',
            template: 'Recurring themes appear in your notes, suggesting attention returns to similar contexts over time.'
        }
    ]
};

/**
 * Rule Set: Career Uncertainty Lens
 * Focus: Stress-energy coupling, structure correlation
 */
export const careerUncertaintyRuleSet: RuleSet = {
    id: 'career-uncertainty',
    name: 'Career Uncertainty Lens',
    reason: 'career-uncertainty',
    description: 'Analyzes stress patterns and structure correlation',

    focusAreas: [
        { metric: 'stress', analysisType: 'trend' },
        { metric: 'energy', analysisType: 'coupling' },
        { metric: 'activity', analysisType: 'frequency' }
    ],

    rules: [
        {
            id: 'stress-energy-coupling',
            condition: (logs: DailyLog[], window: number) => {
                return detectStressEnergyCoupling(logs);
            },
            signal: {
                type: 'stress-energy-coupling',
                detected: false,
                strength: 0,
                description: 'Elevated stress without proportional mood decline'
            },
            weight: 1.0
        },
        {
            id: 'structure-benefit',
            condition: (logs: DailyLog[], window: number) => {
                return detectStructureBenefit(logs);
            },
            signal: {
                type: 'structure-benefit',
                detected: false,
                strength: 0,
                description: 'Mood stability correlates with structured days'
            },
            weight: 0.9
        },
        {
            id: 'flat-mood-high-stress',
            condition: (logs: DailyLog[], window: number) => {
                const avgStress = average(logs.map(l => l.stress));
                const moodVariance = calculateVariance(logs.map(l => l.mood));
                return avgStress > 3.5 && moodVariance < 0.8;
            },
            signal: {
                type: 'flat-mood-high-stress',
                detected: false,
                strength: 0,
                description: 'Stress remains elevated while mood stays relatively stable'
            },
            weight: 0.8
        }
    ],

    observationTemplates: [
        {
            condition: 'stress-energy-coupling && structure-benefit',
            template: 'Higher stress appears without proportional mood decline. Structure-related signals often coincide with more stable days.'
        },
        {
            condition: 'structure-benefit',
            template: 'Days with activity show higher mood levels compared to less structured days. Pattern suggests structure may provide stabilization.'
        },
        {
            condition: 'flat-mood-high-stress',
            template: 'Stress levels remain elevated while mood shows minimal variation. This pattern differs from emotional volatility.'
        }
    ]
};

/**
 * Rule Set: Overthinking/Rumination Lens
 * Focus: Mental looping, mood stagnation
 */
export const overthinkingRuleSet: RuleSet = {
    id: 'overthinking',
    name: 'Overthinking / Rumination Lens',
    reason: 'overthinking',
    description: 'Analyzes mental looping and mood stagnation patterns',

    focusAreas: [
        { metric: 'notes', analysisType: 'content' },
        { metric: 'mood', analysisType: 'variance' }
    ],

    rules: [
        {
            id: 'mental-looping',
            condition: (logs: DailyLog[], window: number) => {
                return detectNoteLengthIncrease(logs);
            },
            signal: {
                type: 'mental-looping',
                detected: false,
                strength: 0,
                description: 'Extended reflection without mood movement'
            },
            weight: 1.0
        },
        {
            id: 'mood-stagnation',
            condition: (logs: DailyLog[], window: number) => {
                const avgMood = average(logs.map(l => l.mood));
                const variance = calculateVariance(logs.map(l => l.mood));
                return avgMood < 2.5 && variance < 0.4;
            },
            signal: {
                type: 'mood-stagnation',
                detected: false,
                strength: 0,
                description: 'Persistent low mood without fluctuation'
            },
            weight: 0.8
        },
        {
            id: 'theme-repetition',
            condition: (logs: DailyLog[], window: number) => {
                const notes = logs.filter(l => l.note).map(l => l.note!);
                if (notes.length < 3) return false;
                return detectThemeRepetition(notes) > 0.7;
            },
            signal: {
                type: 'theme-repetition',
                detected: false,
                strength: 0,
                description: 'High repetition of similar themes in notes'
            },
            weight: 0.9
        }
    ],

    observationTemplates: [
        {
            condition: 'mental-looping && theme-repetition',
            template: 'Extended reflection without mood movement appears repeatedly. This suggests mental looping rather than emotional escalation.'
        },
        {
            condition: 'mood-stagnation && theme-repetition',
            template: 'Mood remains consistently low with minimal variation, while similar themes recur in notes. Pattern suggests sustained focus on specific contexts.'
        },
        {
            condition: 'mental-looping',
            template: 'Note length increases over time without corresponding mood changes, suggesting extended internal processing.'
        }
    ]
};

/**
 * Rule Set: Motivation/Flatness Lens
 * Focus: Energy trends, activity absence, mood inertia
 */
export const motivationIssuesRuleSet: RuleSet = {
    id: 'motivation-issues',
    name: 'Motivation / Flatness Lens',
    reason: 'motivation-issues',
    description: 'Analyzes energy levels and activity patterns',

    focusAreas: [
        { metric: 'energy', analysisType: 'trend' },
        { metric: 'activity', analysisType: 'frequency' },
        { metric: 'mood', analysisType: 'variance' }
    ],

    rules: [
        {
            id: 'low-energy-pattern',
            condition: (logs: DailyLog[], window: number) => {
                const avgEnergy = average(logs.map(l => l.energy));
                return avgEnergy < 2.5;
            },
            signal: {
                type: 'low-energy-pattern',
                detected: false,
                strength: 0,
                description: 'Consistently low energy levels'
            },
            weight: 1.0
        },
        {
            id: 'reduced-activity',
            condition: (logs: DailyLog[], window: number) => {
                const activityFreq = logs.filter(l => l.workoutDone).length / logs.length;
                return activityFreq < 0.3;
            },
            signal: {
                type: 'reduced-activity',
                detected: false,
                strength: 0,
                description: 'Low activity frequency'
            },
            weight: 0.9
        },
        {
            id: 'mood-inertia',
            condition: (logs: DailyLog[], window: number) => {
                const variance = calculateVariance(logs.map(l => l.mood));
                const avgMood = average(logs.map(l => l.mood));
                return variance < 0.5 && avgMood >= 2 && avgMood <= 3.5;
            },
            signal: {
                type: 'mood-inertia',
                detected: false,
                strength: 0,
                description: 'Mood neither improves nor worsens significantly'
            },
            weight: 0.7
        }
    ],

    observationTemplates: [
        {
            condition: 'low-energy-pattern && reduced-activity',
            template: 'Low energy and reduced activity are appearing together, with minimal mood movement. Pattern suggests sustained low activation state.'
        },
        {
            condition: 'low-energy-pattern && mood-inertia',
            template: 'Energy remains consistently low while mood shows minimal variation. Neither significant improvement nor decline is present.'
        },
        {
            condition: 'reduced-activity',
            template: 'Activity frequency is lower than typical patterns. This appears alongside other observed signals.'
        }
    ]
};

/**
 * Rule Set: General Stress Lens
 * Focus: Stress levels, correlation with other metrics
 */
export const generalStressRuleSet: RuleSet = {
    id: 'general-stress',
    name: 'General Stress Lens',
    reason: 'general-stress',
    description: 'Analyzes overall stress patterns',

    focusAreas: [
        { metric: 'stress', analysisType: 'trend' },
        { metric: 'mood', analysisType: 'coupling' }
    ],

    rules: [
        {
            id: 'elevated-stress',
            condition: (logs: DailyLog[], window: number) => {
                const avgStress = average(logs.map(l => l.stress));
                return avgStress > 3.5;
            },
            signal: {
                type: 'elevated-stress',
                detected: false,
                strength: 0,
                description: 'Stress levels consistently elevated'
            },
            weight: 1.0
        },
        {
            id: 'stress-volatility',
            condition: (logs: DailyLog[], window: number) => {
                return detectVolatility(logs, 'stress');
            },
            signal: {
                type: 'stress-volatility',
                detected: false,
                strength: 0,
                description: 'Stress levels fluctuate significantly'
            },
            weight: 0.8
        }
    ],

    observationTemplates: [
        {
            condition: 'elevated-stress',
            template: 'Stress levels remain elevated across the time window. This pattern appears consistently in your data.'
        },
        {
            condition: 'stress-volatility',
            template: 'Stress shows significant fluctuation rather than remaining stable. Variability is present in stress responses.'
        }
    ]
};

/**
 * Get rule set by reason
 */
export function getRuleSetForReason(reason: PerceivedReason): RuleSet {
    const ruleSets: Record<PerceivedReason, RuleSet> = {
        'relationship-change': relationshipChangeRuleSet,
        'career-uncertainty': careerUncertaintyRuleSet,
        'overthinking': overthinkingRuleSet,
        'motivation-issues': motivationIssuesRuleSet,
        'general-stress': generalStressRuleSet,

        // Default/fallback rule sets for other reasons
        'social-conflict': relationshipChangeRuleSet, // Similar patterns
        'loss-separation': relationshipChangeRuleSet,
        'identity-confusion': overthinkingRuleSet,
        'unsure': generalStressRuleSet
    };

    return ruleSets[reason];
}

/**
 * Get all available rule sets
 */
export function getAllRuleSets(): RuleSet[] {
    return [
        relationshipChangeRuleSet,
        careerUncertaintyRuleSet,
        overthinkingRuleSet,
        motivationIssuesRuleSet,
        generalStressRuleSet
    ];
}
