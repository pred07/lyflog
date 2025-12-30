'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserLogs } from '@/lib/firebase/firestore';
import { DailyLog } from '@/lib/types/log';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, isToday } from 'date-fns';
import { HelpCircle } from 'lucide-react';
import DashboardGuide from '@/components/onboarding/DashboardGuide';

export default function DashboardPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        if (user) {
            loadLogs();
        }
    }, [user]);

    const loadLogs = async () => {
        if (!user) return;
        try {
            const userLogs = await getUserLogs(user.userId);
            setLogs(userLogs);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    // 7 Days Data Fixed
    const getChartData = () => {
        const days = 7;
        const dateRange = Array.from({ length: days }, (_, i) => {
            const date = subDays(new Date(), days - 1 - i);
            return startOfDay(date);
        });

        return dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const log = logs.find(l => format(l.date, 'yyyy-MM-dd') === dateStr);
            return {
                date: format(date, 'EEE'), // Mon, Tue, Wed...
                fullDate: format(date, 'MMM dd'),
                sleep: log?.sleep || null,
                workout: log?.workout?.duration || null,
                meditation: log?.meditation || null,
                learning: log?.learning || null,
            };
        });
    };

    // Get Today's Values for Cards
    const getTodayValues = () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todayLog = logs.find(l => format(l.date, 'yyyy-MM-dd') === todayStr);
        return {
            sleep: todayLog?.sleep ?? '-',
            workout: todayLog?.workout?.duration ?? '-',
            meditation: todayLog?.meditation ?? '-',
            learning: todayLog?.learning ?? '-'
        };
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading...</div>;
    }

    const chartData = getChartData();
    const today = getTodayValues();
    const lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="max-w-md mx-auto px-4 py-6">
            {/* Header: Date */}
            <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                {format(new Date(), 'EEEE, MMM d')}
            </h1>

            <button
                onClick={() => setShowGuide(true)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-indigo-500 transition-colors"
                aria-label="Show Guide"
            >
                <HelpCircle size={20} />
            </button>

            <DashboardGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />

            {/* Small Cards Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Sleep</p>
                    <p className="text-2xl font-semibold" style={{ color: 'var(--chart-primary)' }}>{today.sleep}<span className="text-sm font-normal ml-1 text-gray-400">hr</span></p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Workout</p>
                    <p className="text-2xl font-semibold" style={{ color: 'var(--chart-secondary)' }}>{today.workout}<span className="text-sm font-normal ml-1 text-gray-400">min</span></p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Meditation</p>
                    <p className="text-2xl font-semibold" style={{ color: 'var(--chart-tertiary)' }}>{today.meditation}<span className="text-sm font-normal ml-1 text-gray-400">min</span></p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Learning</p>
                    <p className="text-2xl font-semibold text-orange-400">{today.learning}<span className="text-sm font-normal ml-1 text-gray-400">min</span></p>
                </div>
            </div>

            {/* Single Simple Graph */}
            <div className="mb-4">
                <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={chartData}>
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
                            interval="preserveStartEnd"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-secondary)',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                        />
                        <Line type="monotone" dataKey="sleep" stroke="var(--chart-primary)" strokeWidth={2} dot={false} connectNulls />
                        <Line type="monotone" dataKey="workout" stroke="var(--chart-secondary)" strokeWidth={2} dot={false} connectNulls />
                        <Line type="monotone" dataKey="meditation" stroke="var(--chart-tertiary)" strokeWidth={2} dot={false} connectNulls />
                        <Line type="monotone" dataKey="learning" stroke="#ff9f40" strokeWidth={2} dot={false} connectNulls />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Microcopy footer */}
            <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                Last updated today at {lastUpdated}
            </p>
        </div>
    );
}
