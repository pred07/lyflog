'use client';

import { useState } from 'react';
import { CorrelationResult } from '@/lib/analysis/stats';
import { Sparkles, X } from 'lucide-react';
import ConfidenceBadge from '@/components/shared/ConfidenceBadge';

interface SilentPatternIndicatorProps {
    patterns: CorrelationResult[];
}

export default function SilentPatternIndicator({ patterns }: SilentPatternIndicatorProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (patterns.length === 0) return null;

    const getNeutralStatement = (p: CorrelationResult) => {
        const strength = Math.abs(p.coefficient) >= 0.7 ? "strongly associated with" : "associated with";
        const direction = p.coefficient > 0 ? "higher" : "lower";

        // e.g. "Sleep was associated with higher Energy"
        // This is a bit tricky to generate perfectly neutrally without knowing the metric names well.
        // Let's stick to the prompt's example:
        // "Sleep duration was consistently higher on days following meditation" -> This implies lag.
        // Our correlation is same-day for now.
        // "Observations show [MetricY] tends to be [higher/lower] on days with higher [MetricX]"

        return `${p.metricY} tends to be ${direction} on days with higher ${p.metricX}.`;
    };

    return (
        <>
            {/* The Silent Dot */}
            <button
                onClick={() => setIsOpen(true)}
                className="group flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="View observed patterns"
            >
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {patterns.length} pattern{patterns.length > 1 ? 's' : ''} observed
                </span>
            </button>

            {/* The Reveal Modal/Popover */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Observed Patterns
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Correlations found in your data ({'>'}20 days). Not advice.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {patterns.map((p, i) => (
                                <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                                        &quot;{getNeutralStatement(p)}&quot;
                                    </p>
                                    <ConfidenceBadge sampleSize={p.sampleSize} />
                                    <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                                        <span>{p.metricX} ↔ {p.metricY}</span>
                                        <span>r={p.coefficient.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
