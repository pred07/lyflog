'use client';

import { getConfidenceLevel, getDaysNeededForHighConfidence, ConfidenceLevel } from '@/lib/analysis/stats';

interface ConfidenceBadgeProps {
    sampleSize: number;
    className?: string;
}

export default function ConfidenceBadge({ sampleSize, className = '' }: ConfidenceBadgeProps) {
    const confidenceLevel = getConfidenceLevel(sampleSize);
    const daysNeeded = getDaysNeededForHighConfidence(sampleSize);

    const getConfidenceDisplay = (level: ConfidenceLevel) => {
        switch (level) {
            case 'high':
                return {
                    dots: '●●●●●',
                    color: 'text-emerald-500',
                    label: 'High confidence'
                };
            case 'moderate':
                return {
                    dots: '●●●●○',
                    color: 'text-yellow-500',
                    label: 'Moderate confidence'
                };
            case 'emerging':
                return {
                    dots: '●●●○○',
                    color: 'text-orange-500',
                    label: 'Emerging pattern'
                };
            case 'insufficient':
                return {
                    dots: '●○○○○',
                    color: 'text-gray-400',
                    label: 'Insufficient data'
                };
        }
    };

    const { dots, color, label } = getConfidenceDisplay(confidenceLevel);

    return (
        <div className={`flex items-center gap-2 text-xs ${className}`}>
            <span className={`${color} font-mono`} aria-hidden="true">{dots}</span>
            <span style={{ color: 'var(--text-secondary)' }}>
                {label} • {sampleSize} day{sampleSize !== 1 ? 's' : ''}
                {daysNeeded > 0 && ` • needs ${daysNeeded} more`}
            </span>
        </div>
    );
}
