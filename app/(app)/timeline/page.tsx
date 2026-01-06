'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getTimelineData, DayContext } from '@/lib/firebase/timeline';
import { getContextZones } from '@/lib/firebase/context';
import { ContextZone } from '@/lib/types/context';
import TimelineDayCard from '@/components/timeline/TimelineDayCard';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export default function TimelinePage() {
    const { user } = useAuth();
    const [days, setDays] = useState<DayContext[]>([]);
    const [zones, setZones] = useState<ContextZone[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                // Load last 30 days for now
                const end = new Date();
                const start = subDays(end, 29);

                const [timelineData, userZones] = await Promise.all([
                    getTimelineData(user.userId, start, end),
                    getContextZones(user.userId)
                ]);

                setDays(timelineData);
                setZones(userZones);
            } catch (error) {
                console.error('Error loading timeline:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="animate-pulse space-y-12">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="pl-8 border-l border-gray-200 dark:border-gray-800">
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4"></div>
                            <div className="h-32 bg-gray-100 dark:bg-gray-900 rounded-xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <header className="mb-12">
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Timeline
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    A vertical history of everything.
                </p>
            </header>

            <div className="space-y-0 relative">
                {/* Continuous vertical line */}
                <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-200 dark:bg-gray-800" />

                {days.length === 0 ? (
                    <div className="pl-8 py-8 text-gray-500">
                        No entries found in the last 30 days.
                    </div>
                ) : (
                    days.map((day) => (
                        <TimelineDayCard key={day.date.toISOString()} day={day} zones={zones} />
                    ))
                )}
            </div>

            <div className="mt-12 text-center text-sm text-gray-400">
                End of 30-day history
            </div>
        </div>
    );
}
