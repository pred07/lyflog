'use client';

import { X, BarChart2, Activity, Edit3 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome to SYNAPSE</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        A quiet space to observe your patterns.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <Activity className="text-indigo-500" size={24} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>At a Glance</h4>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                The 4 cards showed your day&apos;s stats. The graph shows the last 7 days.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <Edit3 className="text-emerald-500" size={24} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Log Activity</h4>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                Click &quot;Log&quot; to track Sleep, Workouts, Meditation, and Learning in seconds.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <BarChart2 className="text-orange-500" size={24} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Find Patterns</h4>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                Use &quot;Trends&quot; to see how metrics like Sleep affect your Learning or Mood.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        Got it
                    </button>
                    <p className="text-xs text-center mt-3" style={{ color: 'var(--text-tertiary)' }}>
                        You can open this guide anytime from the top right.
                    </p>
                </div>
            </div>
        </div>
    );
}
