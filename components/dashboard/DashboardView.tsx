'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserLogs } from '@/lib/firebase/firestore';
import { getContextZones } from '@/lib/firebase/context';
import { DailyLog } from '@/lib/types/log';
import { ContextZone } from '@/lib/types/context';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts';
import { format, subDays, startOfDay, isWithinInterval } from 'date-fns';
import { HelpCircle, Shield, ShieldOff } from 'lucide-react';
import DashboardGuide from '@/components/onboarding/DashboardGuide';
import Skeleton from '@/components/ui/Skeleton';
import SectionHeader from './SectionHeader';
import { findSignificantCorrelations, CorrelationResult } from '@/lib/analysis/stats';
import SilentPatternIndicator from './SilentPatternIndicator';
import SimilarDays from './SimilarDays';
import HealthMetricsGrid from './HealthMetricsGrid';

export default function DashboardView() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [allLogs, setAllLogs] = useState<DailyLog[]>([]); // Store original
    const [zones, setZones] = useState<ContextZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [showGuide, setShowGuide] = useState(false);

    // Isolation Mode State
    const [isolationMode, setIsolationMode] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                const [userLogs, userZones] = await Promise.all([
                    getUserLogs(user.userId),
                    getContextZones(user.userId)
                ]);
                setAllLogs(userLogs);
                setLogs(userLogs);
                setZones(userZones);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadData();
        }
    }, [user]);

    // Apply Isolation Mode Filter
    useEffect(() => {
        if (!isolationMode) {
            setLogs(allLogs);
            return;
        }

        if (zones.length === 0) return;

        // Filter out logs that fall within any context zone
        const filtered = allLogs.filter(log => {
            // Check if log date is inside any zone
            const isInsideZone = zones.some(zone =>
                isWithinInterval(log.date, { start: zone.startDate, end: zone.endDate })
            );
            return !isInsideZone;
        });

        setLogs(filtered);
    }, [isolationMode, allLogs, zones]);


    const patterns = useMemo(() => {
        if (logs.length < 20) return []; // Require min 20 days as per spec

        // Collect all metrics to scan
        const coreMetrics = ['sleep', 'workout', 'meditation', 'learning'];
        const customMetrics = user?.metrics?.map(m => m.id) || [];
        const exposures = user?.exposures?.map(e => e.id) || [];

        const allMetrics = [...coreMetrics, ...customMetrics, ...exposures];

        return findSignificantCorrelations(logs, allMetrics);
    }, [logs, user]);

    const getChartData = () => {
        const days = 7;
        const dateRange = Array.from({ length: days }, (_, i) => {
            const date = subDays(new Date(), days - 1 - i);
            return startOfDay(date);
        });

        return dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const log = logs.find(l => format(l.date, 'yyyy-MM-dd') === dateStr);

            // Check if this specific day is inside a zone (for visual indication when isolation OFF)
            const activeZone = !isolationMode ? zones.find(zone =>
                isWithinInterval(date, { start: zone.startDate, end: zone.endDate })
            ) : undefined;

            // Collect custom metrics
            const customMetrics = user?.metrics?.reduce((acc, m) => ({
                ...acc,
                [m.id]: log?.metrics?.[m.id] || 0
            }), {}) || {};

            // Collect exposures
            const customExposures = user?.exposures?.reduce((acc, e) => ({
                ...acc,
                [e.id]: log?.exposures?.[e.id] || 0
            }), {}) || {};

            return {
                date: format(date, 'EEE'),
                fullDate: format(date, 'MMM dd'),
                sleep: log?.sleep || 0,
                workout: log?.workout?.duration || 0,
                meditation: log?.meditation || 0,
                learning: log?.learning || 0,
                isZone: !!activeZone,
                zoneLabel: activeZone?.label,
                ...customMetrics,
                ...customExposures
            };
        });
    };

    const getTodayValues = () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todayLog = logs.find(l => format(l.date, 'yyyy-MM-dd') === todayStr);
        return {
            sleep: todayLog?.sleep ?? '-',
            workout: todayLog?.workout?.duration ?? '-',
            meditation: todayLog?.meditation ?? '-',
            learning: todayLog?.learning ?? '-',
            steps: todayLog?.steps,
            water: todayLog?.water,
            calories: todayLog?.calories,
            uvIndex: todayLog?.uvIndex,
            heartRate: todayLog?.heartRate,
            weight: todayLog?.weight
        };
    };
};

if (loading) {
    return (
        <div className="max-w-md mx-auto px-4 py-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-2 gap-3 mb-8">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}

const chartData = getChartData();
const today = getTodayValues();
const lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Helper to calculate average
const getAverage = (key: string) => {
    const sum = chartData.reduce((acc, item: any) => acc + (item[key] || 0), 0);
    const count = chartData.filter((item: any) => item[key] > 0).length;
    return count > 0 ? (sum / count).toFixed(1) : null;
};

const sleepAvg = getAverage('sleep');

return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* --- SECTION 1: OVERVIEW --- */}
        <header className="mb-8">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {format(new Date(), 'EEEE, MMM d')}
                    </h1>
                    <div className="flex items-center gap-2">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {isolationMode
                                ? `Filtering ${allLogs.length - logs.length} context days.`
                                : 'All data included.'}
                        </p>
                        <SilentPatternIndicator patterns={patterns} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Isolation Mode Toggle */}
                    {zones.length > 0 && (
                        <button
                            onClick={() => setIsolationMode(!isolationMode)}
                            className={`p-2 rounded-lg transition-colors ${isolationMode
                                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                }`}
                            title={isolationMode ? "Disable Isolation Mode" : "Enable Isolation Mode (Hide Context Zones)"}
                        >
                            {isolationMode ? <Shield size={20} /> : <ShieldOff size={20} />}
                        </button>
                    )}

                    <button
                        onClick={() => setShowGuide(true)}
                        className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                        <HelpCircle size={20} />
                    </button>
                </div>
            </div>
            <DashboardGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
        </header>

        {/* --- SECTION 2: CORE METRICS --- */}
        <section className="mb-8">
            <SectionHeader title="Core Metrics" description="Biological foundations. Sleep, Movement, Stillness, Growth." />

            {logs.length > 0 && (
                <SimilarDays
                    today={logs.find(l => format(l.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) || {} as DailyLog}
                    history={allLogs} // Use allLogs for history lookup (even if isolation is on, for patterns? Maybe default to Logs which respects isolation)
                    metrics={['sleep', 'workout', 'meditation', 'learning', ...(user?.metrics?.map(m => m.id) || [])]}
                />
            )}

            <div className="grid grid-cols-2 gap-3 mb-6">
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

            {/* Core Sleep Chart (Reference) */}
            <div className="h-32 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} interval="preserveStartEnd" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                        {sleepAvg && <ReferenceLine y={parseFloat(sleepAvg)} stroke="var(--chart-primary)" strokeDasharray="3 3" opacity={0.5} />}
                        <Area type="monotone" dataKey="sleep" stroke="var(--chart-primary)" fill="url(#colorSleep)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>

        {/* --- SECTION 2.5: HEALTH METRICS --- */}
        <HealthMetricsGrid data={today} />

        {/* --- SECTION 3: PERSONAL STATES --- */}
        {user?.metrics && user.metrics.length > 0 && (
            <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <SectionHeader title="Personal States" description="Your subjective experience. Tracked by you." />

                <div className="space-y-6">
                    {user.metrics.slice(0, 3).map((metric, i) => (
                        <div key={metric.id}>
                            <div className="flex justify-between items-center mb-1 px-1">
                                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{metric.label}</span>
                                <span className="text-xs text-gray-400">Avg: {getAverage(metric.id) || '-'}</span>
                            </div>
                            <div className="h-24">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id={`color_${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" hide />
                                        <Tooltip cursor={{ stroke: 'var(--border)' }} contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                                        <Area type="monotone" dataKey={metric.id} stroke="#8b5cf6" fill={`url(#color_${metric.id})`} strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* --- SECTION 4: EXPOSURES --- */}
        {user?.exposures && user.exposures.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <SectionHeader title="Exposures" description="External inputs. Frequency and Volume." />

                <div className="grid grid-cols-2 gap-4">
                    {user.exposures.map(exp => (
                        <div key={exp.id} className="p-3 rounded-lg border border-[var(--border)] bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{exp.label}</span>
                                <span className="text-xs font-mono text-gray-400">{exp.type}</span>
                            </div>
                            <div className="h-20">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                                        <Bar dataKey={exp.id} fill="var(--text-secondary)" radius={[2, 2, 0, 0]} opacity={0.5} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        <div className="text-center mt-12 mb-4">
            <p className="text-xs text-gray-400">
                Last updated {lastUpdated}
            </p>
        </div>
    </div>
);
}
