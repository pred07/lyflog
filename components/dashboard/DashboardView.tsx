'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserLogs } from '@/lib/firebase/firestore';
import { DailyLog } from '@/lib/types/log';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { HelpCircle } from 'lucide-react';
import DashboardGuide from '@/components/onboarding/DashboardGuide';
import Skeleton from '@/components/ui/Skeleton';

export default function DashboardView() {
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
        return (
            <div className="max-w-md mx-auto px-4 py-6">
                {/* Header Skeleton */}
                <Skeleton className="h-8 w-48 mb-6" />

                {/* Cards Grid Skeleton */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-4 rounded-xl card h-24">
                            <Skeleton className="h-3 w-16 mb-2" />
                            <Skeleton className="h-8 w-12" />
                        </div>
                    ))}
                </div>

                {/* Chart Skeleton */}
                <div className="mb-4">
                    <Skeleton className="h-[150px] w-full rounded-xl" />
                </div>
            </div>
        );
    }

    const chartData = getChartData();
    const today = getTodayValues();
    const lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Calculate Sleep Average for Reference Line
    const sleepSum = chartData.reduce((sum, d) => sum + (d.sleep || 0), 0);
    const validSleepDays = chartData.filter(d => d.sleep !== null && d.sleep > 0).length;
    const sleepAvg = validSleepDays > 0 ? (sleepSum / validSleepDays).toFixed(1) : null;

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
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorWorkout" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-secondary)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="var(--chart-secondary)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorMeditation" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-tertiary)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="var(--chart-tertiary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
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
                                fontSize: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                        />
                        {sleepAvg && (
                            <ReferenceLine y={parseFloat(sleepAvg)} stroke="var(--chart-primary)" strokeDasharray="3 3" opacity={0.5} />
                        )}
                        <Area type="monotone" dataKey="sleep" stroke="var(--chart-primary)" fillOpacity={1} fill="url(#colorSleep)" strokeWidth={2} connectNulls />
                        <Area type="monotone" dataKey="workout" stroke="var(--chart-secondary)" fillOpacity={1} fill="url(#colorWorkout)" strokeWidth={2} connectNulls />
                        <Area type="monotone" dataKey="meditation" stroke="var(--chart-tertiary)" fillOpacity={1} fill="url(#colorMeditation)" strokeWidth={2} connectNulls />
                        <Area type="monotone" dataKey="learning" stroke="#ff9f40" fill="none" strokeWidth={2} connectNulls />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Microcopy footer */}
            <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                Last updated today at {lastUpdated}
            </p>
        </div>
    );
}
